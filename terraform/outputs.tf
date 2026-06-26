output "cluster_name" {
  value = aws_eks_cluster.main.name
}

output "cluster_endpoint" {
  value = aws_eks_cluster.main.endpoint
}

output "cluster_version" {
  value = aws_eks_cluster.main.version
}

output "vpc_id" {
  value = data.aws_vpc.default.id
}

output "account_id" {
  value = data.aws_caller_identity.current.account_id
}

output "lab_role_arn" {
  value = data.aws_iam_role.lab_role.arn
}

output "kubeconfig_command" {
  description = "Commande pour configurer kubectl"
  value       = "aws eks update-kubeconfig --name ${aws_eks_cluster.main.name} --region ${var.region}"
}
