variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "cluster_name" {
  description = "Nom du cluster EKS"
  type        = string
  default     = "eks-academy"
}

variable "cluster_version" {
  description = "Version de Kubernetes"
  type        = string
  default     = "1.31"
}

variable "node_instance_type" {
  description = "Type d'instance EC2 pour les noeuds (t3.medium minimum recommandé pour K8s)"
  type        = string
  default     = "t3.medium"
}

variable "node_desired_size" {
  type    = number
  default = 2
}

variable "node_min_size" {
  type    = number
  default = 1
}

variable "node_max_size" {
  type    = number
  default = 3
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "account_id" {
  description = "AWS Account ID (visible dans terraform plan ou aws sts get-caller-identity)"
  type        = string
  default     = "787943492246"
}

