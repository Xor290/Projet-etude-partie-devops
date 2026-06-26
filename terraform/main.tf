terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
  # Credentials lus depuis ~/.aws/credentials (access_key + secret_key + session_token)
}

data "aws_caller_identity" "current" {}

