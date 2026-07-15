output "aws_region" {
  description = "AWS region targeted by this Terraform environment."
  value       = var.aws_region
}

output "name_prefix" {
  description = "Shared prefix for demo AWS resources."
  value       = local.name_prefix
}
