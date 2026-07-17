# Terraform Infrastructure

Terraform entry points for the AWS portfolio deployment.

## Environments

| Environment | Path                | Purpose             |
| ----------- | ------------------- | ------------------- |
| demo        | `environments/demo` | demo AWS deployment |

## Current scope

The demo environment currently manages:

- S3 + CloudFront frontend hosting.
- GitHub Actions OIDC for frontend deploys.
- RDS PostgreSQL plan/configuration for Checkpoint D.

## Cost posture

This is an intro AWS portfolio demo, not a production traffic workload. Defaults
must prefer the smallest pay-as-you-go shape:

- use free-tier/credit-friendly resource sizes where possible;
- avoid NAT Gateway unless explicitly approved;
- avoid always-on load balancers, ECS/Fargate, WAF, Route 53, and custom-domain
  infrastructure unless explicitly approved;
- keep paid secrets/config services opt-in;
- use one small public EC2 API host instead of NAT Gateway or a load balancer;
- keep teardown paths documented before applying paid resources.

## AWS Console checkpoints

No AWS Console setup is required for Checkpoint A beyond having an AWS account, credentials configured locally, and budget alerts already in place.

You will need AWS Console access at these later checkpoints:

- **Before Checkpoint B:** review S3 bucket and CloudFront distribution after Terraform creates them.
- **Before Checkpoint D:** review RDS networking, security groups, credentials, and cost settings before applying database infrastructure.
- **Before Checkpoint E:** review Secrets Manager/SSM values and CloudWatch alarms.

## Commands

Run commands from an environment directory, for example:

```bash
cd infra/terraform/environments/demo
terraform init
terraform fmt -recursive
terraform validate
terraform plan
```

Do not run `terraform apply` until the plan output has been reviewed.
