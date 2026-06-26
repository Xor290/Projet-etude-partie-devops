#!/usr/bin/env bash
# Deploy ArgoCD on EKS and wire it up to Gitea
# Usage: ./deploy-argocd.sh
# Requires: kubectl, ~/argocd (CLI), aws CLI, active AWS Academy session

set -euo pipefail

ACCOUNT_ID="787943492246"
REGION="us-east-1"
ARGOCD_NS="argocd"
ALTHEA_NS="althea"

# ── 1. Install ArgoCD ────────────────────────────────────────────────────────

echo "[1/6] Creating namespace and installing ArgoCD..."
kubectl create namespace $ARGOCD_NS --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -n $ARGOCD_NS -f \
  https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

echo "[1/6] Waiting for argocd-server to be ready (~3 min)..."
kubectl wait --for=condition=available --timeout=300s \
  deployment/argocd-server -n $ARGOCD_NS

# ── 2. Expose via LoadBalancer ───────────────────────────────────────────────

echo "[2/6] Exposing ArgoCD via LoadBalancer..."
kubectl patch svc argocd-server -n $ARGOCD_NS \
  -p '{"spec": {"type": "LoadBalancer"}}'

echo "[2/6] Waiting for LoadBalancer IP (~2 min)..."
until kubectl get svc argocd-server -n $ARGOCD_NS \
    -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null | grep -q "."; do
  sleep 5
done

ARGOCD_URL=$(kubectl get svc argocd-server -n $ARGOCD_NS \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
ARGOCD_PASS=$(kubectl get secret argocd-initial-admin-secret -n $ARGOCD_NS \
  -o jsonpath="{.data.password}" | base64 -d)

echo ""
echo "  ArgoCD URL  : http://$ARGOCD_URL"
echo "  Login       : admin"
echo "  Password    : $ARGOCD_PASS"
echo ""

# ── 3. Install ArgoCD CLI if missing ────────────────────────────────────────

if ! command -v ~/argocd &>/dev/null; then
  echo "[3/6] Installing ArgoCD CLI..."
  curl -sSL -o ~/argocd \
    https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
  chmod +x ~/argocd
else
  echo "[3/6] ArgoCD CLI already installed."
fi

~/argocd login "$ARGOCD_URL" \
  --username admin \
  --password "$ARGOCD_PASS" \
  --insecure

# ── 4. Register Gitea repos ──────────────────────────────────────────────────

echo "[4/6] Registering Gitea repositories..."

GITEA_URL="http://$(kubectl get svc gitea -n gitea \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')"

for REPO in devops althea-system-back althea-system-front; do
  ~/argocd repo add "$GITEA_URL/devops/$REPO.git" \
    --username devops \
    --password A3oVu73FEqsgwW5TPgX2r6fw9HOM \
    --insecure-skip-server-verification
done

# ── 5. Create ArgoCD applications ────────────────────────────────────────────

echo "[5/6] Creating ArgoCD applications..."

ECR_BACK="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/althea-system-back"
ECR_FRONT="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/althea-system-front"

~/argocd app create althea-backend \
  --repo "$GITEA_URL/devops/devops.git" \
  --revision helm \
  --path charts/althea-backend \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace $ALTHEA_NS \
  --sync-policy automated \
  --auto-prune \
  --self-heal \
  --helm-set image.repository="$ECR_BACK" \
  --helm-set image.tag=latest \
  --helm-set image.pullPolicy=Always \
  --helm-set migrations.enabled=false \
  --helm-set service.type=LoadBalancer \
  --sync-option CreateNamespace=true \
  --upsert

~/argocd app create althea-frontend \
  --repo "$GITEA_URL/devops/devops.git" \
  --revision helm \
  --path charts/althea-frontend \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace $ALTHEA_NS \
  --sync-policy automated \
  --auto-prune \
  --self-heal \
  --helm-set image.repository="$ECR_FRONT" \
  --helm-set image.tag=latest \
  --helm-set image.pullPolicy=Always \
  --helm-set service.type=LoadBalancer \
  --sync-option CreateNamespace=true \
  --upsert

# ── 6. Initial sync ──────────────────────────────────────────────────────────

echo "[6/6] Syncing applications..."
~/argocd app sync althea-backend
~/argocd app sync althea-frontend

# ── Summary ──────────────────────────────────────────────────────────────────

echo ""
echo "========================================="
echo " ArgoCD deployment complete"
echo "========================================="
echo " UI        : http://$ARGOCD_URL"
echo " Login     : admin / $ARGOCD_PASS"
echo " Gitea     : $GITEA_URL"
echo ""
echo " Applications:"
~/argocd app list
echo ""
echo " If Gitea URL changes in the future, run:"
echo "   ./update-argocd-repo.sh"
echo "========================================="
