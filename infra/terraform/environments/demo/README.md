# Demo Terraform Environment

Terraform root module for the AWS-hosted portfolio demo.

## Purpose

This environment will grow in checkpoints:

1. Terraform foundation with no AWS resources.
2. S3 + CloudFront frontend hosting.
3. RDS PostgreSQL.
4. EC2 API server.
5. Secrets/config and observability.

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

rds_instance_class              = "db.t4g.micro"
rds_engine_version              = "17"
rds_allocated_storage_gb        = 20
rds_backup_retention_days       = 0

ec2_instance_type           = "t3.micro"
ec2_root_volume_size_gb     = 8
ec2_api_port                = 4000
ec2_ssh_ingress_cidr_blocks = []
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
- Terraform-generated master password in ignored local state by default

The database is private by default:

```hcl
rds_publicly_accessible = false
rds_ingress_cidr_blocks = []
rds_ingress_security_group_ids = []
```

## Cost guardrails

This environment is for a very low-traffic portfolio demo and should stay on the
lowest practical pay-as-you-go footprint:

- keep RDS at `db.t4g.micro`;
- keep RDS storage fixed at 20 GiB;
- use `gp2` RDS storage to stay aligned with the RDS free-tier storage shape;
- keep automated backups disabled by default with `rds_backup_retention_days = 0`;
- keep RDS credentials in Terraform local state by default to avoid the
  recurring Secrets Manager per-secret charge;
- do not add NAT Gateway by default;
- do not add custom domains, ACM, WAF, Route 53, ECS/Fargate, or load balancers
  unless explicitly accepted as paid upgrades.
- expect one public IPv4 charge while the EC2 API host is running; this is the
  low-complexity trade-off that avoids NAT Gateway, load balancers, and custom
  domain infrastructure.

Checkpoint E adds the EC2 API foundation:

- one `t3.micro` EC2 instance;
- 8 GiB encrypted root volume;
- Docker installed through user data;
- API security group with inbound port `4000`;
- SSH closed by default;
- outbound internet directly from the public subnet;
- RDS ingress limited to the EC2 API security group.

The browser-facing cutover should eventually use CloudFront as the HTTPS entry
point for API calls. Direct EC2 HTTP is useful for smoke testing, but the
CloudFront frontend should not call a plain HTTP EC2 URL from the browser.

Do not set `rds_publicly_accessible = true` without explicitly accepting the
security trade-off. The canonical path is private RDS access from the EC2 API
security group.

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
```

The generated master password is stored in ignored local Terraform state. Do not
copy resolved database credentials into source control.
