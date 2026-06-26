#!/usr/bin/env bash
# Update ArgoCD repos and apps when the Gitea LoadBalancer URL changes
# Usage: ./update-argocd-repo.sh [old-gitea-hostname]
# If old-gitea-hostname is omitted, all repos starting with http:// are listed and removed

set -euo pipefail

ARGOCD_NS="argocd"

# ── Login ────────────────────────────────────────────────────────────────────

ARGOCD_URL=$(kubectl get svc argocd-server -n $ARGOCD_NS \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
ARGOCD_PASS=$(kubectl get secret argocd-initial-admin-secret -n $ARGOCD_NS \
  -o jsonpath="{.data.password}" | base64 -d)

~/argocd login "$ARGOCD_URL" \
  --username admin \
  --password "$ARGOCD_PASS" \
  --insecure 2>&1 | tail -1

# ── Detect current Gitea URL ─────────────────────────────────────────────────

NEW_GITEA_URL="http://$(kubectl get svc gitea -n gitea \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')"

echo "New Gitea URL: $NEW_GITEA_URL"

# ── Remove all old repos ─────────────────────────────────────────────────────

echo "Removing stale repos..."
~/argocd repo list -o url 2>/dev/null | while read -r OLD_URL; do
  if [[ "$OLD_URL" != "$NEW_GITEA_URL"* ]]; then
    echo "  Removing: $OLD_URL"
    ~/argocd repo rm "$OLD_URL" 2>/dev/null || true
  fi
done

# ── Add new repos ────────────────────────────────────────────────────────────

echo "Adding updated repos..."
for REPO in devops althea-system-back althea-system-front; do
  ~/argocd repo add "$NEW_GITEA_URL/devops/$REPO.git" \
    --username devops \
    --password A3oVu73FEqsgwW5TPgX2r6fw9HOM \
    --insecure-skip-server-verification
done

# ── Update apps ───────────────────────────────────────────────────────────────

echo "Updating ArgoCD applications..."
~/argocd app set althea-backend  --repo "$NEW_GITEA_URL/devops/devops.git"
~/argocd app set althea-frontend --repo "$NEW_GITEA_URL/devops/devops.git"

~/argocd app sync althea-backend
~/argocd app sync althea-frontend

echo ""
~/argocd app list
echo ""
echo "Done. ArgoCD is now pointing to $NEW_GITEA_URL"
