output "aws_region" {
  description = "AWS region targeted by this Terraform environment."
  value       = var.aws_region
}

output "name_prefix" {
  description = "Shared prefix for demo AWS resources."
  value       = local.name_prefix
}

output "frontend_bucket_name" {
  description = "Private S3 bucket used for CloudFront frontend assets."
  value       = aws_s3_bucket.frontend.bucket
}

output "frontend_cloudfront_distribution_id" {
  description = "CloudFront distribution ID for frontend hosting."
  value       = aws_cloudfront_distribution.frontend.id
}

output "frontend_cloudfront_domain_name" {
  description = "Default CloudFront domain name for the frontend."
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "frontend_cloudfront_url" {
  description = "Default HTTPS URL for the CloudFront-hosted frontend."
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "frontend_spa_rewrite_function_name" {
  description = "CloudFront Function that rewrites SPA directory routes to index.html."
  value       = aws_cloudfront_function.spa_rewrite.name
}

output "github_actions_role_arn" {
  description = "IAM role ARN for GitHub Actions OIDC frontend deployments."
  value       = aws_iam_role.github_actions_frontend_deploy.arn
}

output "rds_database_name" {
  description = "Initial PostgreSQL database name."
  value       = aws_db_instance.postgres.db_name
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint."
  value       = aws_db_instance.postgres.endpoint
}

output "rds_port" {
  description = "RDS PostgreSQL port."
  value       = aws_db_instance.postgres.port
}

output "rds_security_group_id" {
  description = "Security group attached to the RDS PostgreSQL instance."
  value       = aws_security_group.rds.id
}

output "api_instance_id" {
  description = "EC2 instance ID for the API server."
  value       = aws_instance.api.id
}

output "api_public_dns" {
  description = "Public DNS name for the EC2 API server."
  value       = aws_instance.api.public_dns
}

output "api_public_ip" {
  description = "Public IPv4 address for the EC2 API server."
  value       = aws_instance.api.public_ip
}

output "api_security_group_id" {
  description = "Security group attached to the EC2 API server."
  value       = aws_security_group.api.id
}

output "api_url" {
  description = "Direct HTTP URL for the EC2 API server."
  value       = "http://${aws_instance.api.public_dns}:${var.ec2_api_port}"
}
