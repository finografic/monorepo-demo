# Terraform Infrastructure

Terraform entry points for the AWS portfolio deployment.

## Environments

| Environment | Path                | Purpose             |
| ----------- | ------------------- | ------------------- |
| demo        | `environments/demo` | demo AWS deployment |

## Current scope

Checkpoint A only creates the Terraform foundation. It does not create or change AWS resources yet.

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
