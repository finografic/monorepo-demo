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
aws_region              = "ap-southeast-2"
project_name            = "monorepo-demo"
environment             = "demo"
app_runner_api_base_url = "https://qvyq3mdegk.ap-southeast-2.awsapprunner.com"
```

## Commands

```bash
terraform init
terraform fmt -recursive
terraform validate
terraform plan
```

## Apply policy

Do not run `terraform apply` until the plan has been reviewed.

Checkpoint B creates the first AWS resources:

- private S3 bucket
- CloudFront Origin Access Control
- CloudFront distribution
- S3 bucket policy for CloudFront reads
