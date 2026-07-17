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

Checkpoint D adds the RDS foundation:

- RDS PostgreSQL instance
- DB subnet group using the default VPC subnets
- RDS security group with no inbound access by default
- RDS-managed master user password in Secrets Manager

The database is private by default:

```hcl
rds_publicly_accessible = false
rds_ingress_cidr_blocks = []
rds_ingress_security_group_ids = []
```

Before applying RDS, decide the App Runner connectivity path:

- private RDS + App Runner VPC connector + NAT for public provider calls, or
- a temporary public RDS exception with tightly scoped ingress.

Do not set `rds_publicly_accessible = true` without explicitly accepting the
security trade-off.

## GitHub Actions CloudFront deploy

The manual workflow `.github/workflows/deploy-aws-frontend.yml` builds the same
CloudFront-targeted frontend bundle as local deploys, syncs `pages/` to S3, and
invalidates CloudFront.

Required repository configuration:

- Environment: `aws-cloudfront`
- Repository secret: `NPM_TOKEN`
- Environment variable: `AWS_GITHUB_ACTIONS_ROLE_ARN`

After applying Terraform, copy the output into that GitHub environment variable:

```bash
terraform output github_actions_role_arn
```

The AWS role should be assumable by GitHub Actions through OIDC and scoped to
this repository. It needs only the permissions required to deploy the static
frontend:

- `s3:ListBucket` on `arn:aws:s3:::monorepo-demo-demo-frontend`
- `s3:GetObject`, `s3:PutObject`, and `s3:DeleteObject` on `arn:aws:s3:::monorepo-demo-demo-frontend/*`
- `cloudfront:CreateInvalidation` on distribution `ERCVOSB81GPS9`

Keep the existing GitHub Pages workflow enabled until this workflow has been run
and verified.

## RDS outputs

After RDS apply, Terraform exposes:

```bash
terraform output rds_endpoint
terraform output rds_database_name
terraform output rds_port
terraform output rds_security_group_id
terraform output rds_master_user_secret_arn
```

`rds_master_user_secret_arn` is sensitive and points to the RDS-managed Secrets
Manager secret. Do not copy resolved database credentials into source control.
