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
