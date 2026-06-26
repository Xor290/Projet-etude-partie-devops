#!/usr/bin/env bash
# Deploy AWS WAF + ALB + HTTPS in front of the Althea frontend (NodePort)
# Uses a self-signed certificate imported into ACM (no domain required).
# To use a real domain instead, set DOMAIN and run:
#   aws acm request-certificate --domain-name yourdomain.com --validation-method DNS
# then replace CERT_ARN below.

set -euo pipefail

REGION="us-east-1"
CLUSTER="eks-academy"
ALB_NAME="althea-waf-alb"
WAF_NAME="althea-waf-regional"
ALB_SG_NAME="althea-alb-sg"
TG_NAME="althea-frontend-tg"
CERT_DOMAIN="althea.local"
CERT_DIR="/tmp/althea-cert"

# ── 1. WAF régional ──────────────────────────────────────────────────────────

echo "[1/8] Creating regional WAF WebACL..."

EXISTING_WAF=$(aws wafv2 list-web-acls --scope REGIONAL --region $REGION \
  --query "WebACLs[?Name=='$WAF_NAME'].ARN" --output text)

if [ -n "$EXISTING_WAF" ]; then
  WAF_ARN="$EXISTING_WAF"
  echo "  WAF already exists: $WAF_ARN"
else
  WAF_ARN=$(aws wafv2 create-web-acl \
    --name "$WAF_NAME" \
    --scope REGIONAL \
    --region $REGION \
    --default-action Allow={} \
    --rules '[
      {
        "Name": "CommonRuleSet",
        "Priority": 1,
        "Statement": {"ManagedRuleGroupStatement": {"VendorName": "AWS", "Name": "AWSManagedRulesCommonRuleSet"}},
        "OverrideAction": {"None": {}},
        "VisibilityConfig": {"SampledRequestsEnabled": true, "CloudWatchMetricsEnabled": true, "MetricName": "CommonRuleSet"}
      },
      {
        "Name": "SQLiRuleSet",
        "Priority": 2,
        "Statement": {"ManagedRuleGroupStatement": {"VendorName": "AWS", "Name": "AWSManagedRulesSQLiRuleSet"}},
        "OverrideAction": {"None": {}},
        "VisibilityConfig": {"SampledRequestsEnabled": true, "CloudWatchMetricsEnabled": true, "MetricName": "SQLiRuleSet"}
      }
    ]' \
    --visibility-config SampledRequestsEnabled=true,CloudWatchMetricsEnabled=true,MetricName=althea-waf \
    --query 'Summary.ARN' --output text)
  echo "  WAF created: $WAF_ARN"
fi

# ── 2. Certificat HTTPS (auto-signé → ACM) ───────────────────────────────────

echo "[2/8] Setting up HTTPS certificate..."

EXISTING_CERT=$(aws acm list-certificates --region $REGION \
  --query "CertificateSummaryList[?DomainName=='$CERT_DOMAIN'].CertificateArn" \
  --output text)

if [ -n "$EXISTING_CERT" ]; then
  CERT_ARN="$EXISTING_CERT"
  echo "  Certificate already exists: $CERT_ARN"
else
  mkdir -p "$CERT_DIR"

  # Générer une clé privée + certificat auto-signé (valide 2 ans)
  openssl req -x509 -nodes -days 730 -newkey rsa:2048 \
    -keyout "$CERT_DIR/althea.key" \
    -out "$CERT_DIR/althea.crt" \
    -subj "/CN=$CERT_DOMAIN/O=Althea System/C=FR" \
    -addext "subjectAltName=DNS:$CERT_DOMAIN" \
    2>/dev/null

  # Importer dans ACM
  CERT_ARN=$(aws acm import-certificate \
    --certificate fileb://"$CERT_DIR/althea.crt" \
    --private-key fileb://"$CERT_DIR/althea.key" \
    --region $REGION \
    --query 'CertificateArn' --output text)

  echo "  Certificate imported: $CERT_ARN"
  echo "  Note: self-signed cert — browsers will warn. Replace with ACM public cert if you have a domain."
fi

# ── 3. Infos réseau ──────────────────────────────────────────────────────────

echo "[3/8] Gathering network info..."

VPC_ID=$(aws ec2 describe-vpcs --filters Name=isDefault,Values=true \
  --query 'Vpcs[0].VpcId' --output text --region $REGION)

VPC_CIDR=$(aws ec2 describe-vpcs --filters Name=isDefault,Values=true \
  --query 'Vpcs[0].CidrBlock' --output text --region $REGION)

SUBNETS=$(aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=$VPC_ID" \
  --query 'Subnets[?AvailabilityZone!=`us-east-1e`].SubnetId' \
  --output text --region $REGION | tr '\t' ' ')

NODE_PORT=$(kubectl get svc althea-frontend-althea-frontend -n althea \
  -o jsonpath='{.spec.ports[0].nodePort}')

NODE_IPS=$(kubectl get nodes \
  -o jsonpath='{.items[*].status.addresses[?(@.type=="InternalIP")].address}')

FIRST_NODE_IP=$(echo "$NODE_IPS" | awk '{print $1}')
NODE_SG=$(aws ec2 describe-instances \
  --filters "Name=private-ip-address,Values=$FIRST_NODE_IP" \
  --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' \
  --output text --region $REGION)

echo "  VPC       : $VPC_ID ($VPC_CIDR)"
echo "  NodePort  : $NODE_PORT"
echo "  Node IPs  : $NODE_IPS"
echo "  Node SG   : $NODE_SG"

# ── 4. Security Group ALB ────────────────────────────────────────────────────

echo "[4/8] Creating ALB security group..."

EXISTING_ALB_SG=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=$ALB_SG_NAME" "Name=vpc-id,Values=$VPC_ID" \
  --query 'SecurityGroups[0].GroupId' --output text --region $REGION 2>/dev/null || true)

if [ -n "$EXISTING_ALB_SG" ] && [ "$EXISTING_ALB_SG" != "None" ]; then
  ALB_SG="$EXISTING_ALB_SG"
  echo "  ALB SG already exists: $ALB_SG"
else
  ALB_SG=$(aws ec2 create-security-group \
    --group-name "$ALB_SG_NAME" \
    --description "ALB WAF Althea" \
    --vpc-id $VPC_ID \
    --region $REGION \
    --query 'GroupId' --output text)

  aws ec2 authorize-security-group-ingress \
    --group-id $ALB_SG --protocol tcp --port 80  --cidr 0.0.0.0/0 --region $REGION > /dev/null
  aws ec2 authorize-security-group-ingress \
    --group-id $ALB_SG --protocol tcp --port 443 --cidr 0.0.0.0/0 --region $REGION > /dev/null
  echo "  ALB SG created: $ALB_SG"
fi

# Ouvrir le NodePort sur les nodes depuis le CIDR VPC
# (règle CIDR — évite les timeouts de health check avec une règle SG-ref)
aws ec2 authorize-security-group-ingress \
  --group-id $NODE_SG \
  --protocol tcp --port $NODE_PORT --cidr $VPC_CIDR \
  --region $REGION 2>&1 | grep -v "already exists" || true

echo "  NodePort $NODE_PORT ouvert sur $NODE_SG depuis $VPC_CIDR"

# ── 5. Target Group ──────────────────────────────────────────────────────────

echo "[5/8] Creating target group..."

EXISTING_TG=$(aws elbv2 describe-target-groups \
  --names "$TG_NAME" --region $REGION \
  --query 'TargetGroups[0].TargetGroupArn' --output text 2>/dev/null || true)

if [ -n "$EXISTING_TG" ] && [ "$EXISTING_TG" != "None" ]; then
  TG_ARN="$EXISTING_TG"
  echo "  Target group already exists: $TG_ARN"
else
  TG_ARN=$(aws elbv2 create-target-group \
    --name "$TG_NAME" \
    --protocol HTTP \
    --port $NODE_PORT \
    --vpc-id $VPC_ID \
    --target-type instance \
    --health-check-path "/" \
    --health-check-interval-seconds 10 \
    --healthy-threshold-count 2 \
    --unhealthy-threshold-count 2 \
    --health-check-timeout-seconds 5 \
    --region $REGION \
    --query 'TargetGroups[0].TargetGroupArn' --output text)
  echo "  Target group created: $TG_ARN"
fi

for IP in $NODE_IPS; do
  INSTANCE_ID=$(aws ec2 describe-instances \
    --filters "Name=private-ip-address,Values=$IP" \
    --query 'Reservations[0].Instances[0].InstanceId' --output text --region $REGION)
  aws elbv2 register-targets \
    --target-group-arn $TG_ARN \
    --targets Id=$INSTANCE_ID,Port=$NODE_PORT \
    --region $REGION
  echo "  Registered $INSTANCE_ID ($IP:$NODE_PORT)"
done

# ── 6. ALB ───────────────────────────────────────────────────────────────────

echo "[6/8] Creating ALB..."

EXISTING_ALB=$(aws elbv2 describe-load-balancers \
  --names "$ALB_NAME" --region $REGION \
  --query 'LoadBalancers[0].LoadBalancerArn' --output text 2>/dev/null || true)

if [ -n "$EXISTING_ALB" ] && [ "$EXISTING_ALB" != "None" ]; then
  ALB_ARN="$EXISTING_ALB"
  echo "  ALB already exists: $ALB_ARN"
else
  ALB_ARN=$(aws elbv2 create-load-balancer \
    --name "$ALB_NAME" \
    --subnets $SUBNETS \
    --security-groups $ALB_SG \
    --scheme internet-facing \
    --type application \
    --region $REGION \
    --query 'LoadBalancers[0].LoadBalancerArn' --output text)
  echo "  ALB created: $ALB_ARN"
fi

# Listener HTTPS:443 → Target Group
EXISTING_HTTPS=$(aws elbv2 describe-listeners \
  --load-balancer-arn $ALB_ARN --region $REGION \
  --query 'Listeners[?Port==`443`].ListenerArn' --output text 2>/dev/null || true)

if [ -z "$EXISTING_HTTPS" ] || [ "$EXISTING_HTTPS" = "None" ]; then
  aws elbv2 create-listener \
    --load-balancer-arn $ALB_ARN \
    --protocol HTTPS --port 443 \
    --ssl-policy ELBSecurityPolicy-TLS13-1-2-2021-06 \
    --certificates CertificateArn=$CERT_ARN \
    --default-actions Type=forward,TargetGroupArn=$TG_ARN \
    --region $REGION > /dev/null
  echo "  Listener HTTPS:443 created"
fi

# Listener HTTP:80 → redirect HTTPS
EXISTING_HTTP=$(aws elbv2 describe-listeners \
  --load-balancer-arn $ALB_ARN --region $REGION \
  --query 'Listeners[?Port==`80`].ListenerArn' --output text 2>/dev/null || true)

if [ -z "$EXISTING_HTTP" ] || [ "$EXISTING_HTTP" = "None" ]; then
  aws elbv2 create-listener \
    --load-balancer-arn $ALB_ARN \
    --protocol HTTP --port 80 \
    --default-actions 'Type=redirect,RedirectConfig={Protocol=HTTPS,Port=443,StatusCode=HTTP_301}' \
    --region $REGION > /dev/null
  echo "  Listener HTTP:80 → redirect HTTPS:443 created"
fi

# ── 7. Attendre ALB actif et associer WAF ────────────────────────────────────

echo "[7/8] Waiting for ALB to be active (~2 min)..."
aws elbv2 wait load-balancer-available \
  --load-balancer-arns $ALB_ARN --region $REGION

aws wafv2 associate-web-acl \
  --web-acl-arn $WAF_ARN \
  --resource-arn $ALB_ARN \
  --region $REGION
echo "  WAF associated"

# ── 8. Vérification health check ─────────────────────────────────────────────

echo "[8/8] Waiting for targets to become healthy..."
ATTEMPTS=0
until aws elbv2 describe-target-health \
    --target-group-arn $TG_ARN --region $REGION \
    --query 'TargetHealthDescriptions[?TargetHealth.State==`healthy`]' \
    --output text | grep -q .; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [ $ATTEMPTS -ge 24 ]; then
    echo "  Targets still unhealthy after 2 min — check security groups"
    aws elbv2 describe-target-health --target-group-arn $TG_ARN --region $REGION \
      --query 'TargetHealthDescriptions[].{Id:Target.Id,State:TargetHealth.State,Reason:TargetHealth.Reason}' \
      --output table
    break
  fi
  sleep 5
done

ALB_DNS=$(aws elbv2 describe-load-balancers \
  --load-balancer-arns $ALB_ARN \
  --query 'LoadBalancers[0].DNSName' --output text --region $REGION)

echo ""
echo "============================================="
echo " WAF + ALB + HTTPS déployé"
echo "============================================="
echo " HTTPS  : https://$ALB_DNS  (⚠ cert auto-signé)"
echo " HTTP   : http://$ALB_DNS   → redirige vers HTTPS"
echo " WAF    : $WAF_NAME"
echo "          rules: CommonRuleSet + SQLiRuleSet"
echo ""
echo " Pour un vrai certificat (sans avertissement) :"
echo "   1. Pointer votre domaine vers $ALB_DNS"
echo "   2. aws acm request-certificate --domain-name VOTRE_DOMAINE --validation-method DNS"
echo "   3. Remplacer le certificat sur le listener 443"
echo "============================================="
echo ""
echo " Targets :"
aws elbv2 describe-target-health --target-group-arn $TG_ARN --region $REGION \
  --query 'TargetHealthDescriptions[].{Instance:Target.Id,State:TargetHealth.State}' \
  --output table
