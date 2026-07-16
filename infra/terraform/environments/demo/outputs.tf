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
