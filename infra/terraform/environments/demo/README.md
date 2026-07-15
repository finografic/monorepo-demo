# Demo Terraform Environment

Terraform root module for the AWS-hosted portfolio demo.

## Purpose

This environment will grow in checkpoints:

1. Terraform foundation with no AWS resources.
2. S3 + CloudFront frontend hosting.
3. RDS PostgreSQL.
4. Secrets/config and observability.

## Setup

Copy the example variables file:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Review values before planning:

```hcl
aws_region  = "ap-southeast-2"
project_name = "monorepo-demo"
environment = "demo"
```

## Commands

```bash
terraform init
terraform fmt -recursive
terraform validate
terraform plan
```

## Apply policy

This environment should stay no-op during Checkpoint A. Do not apply resource changes until the relevant checkpoint is ready for AWS review.
