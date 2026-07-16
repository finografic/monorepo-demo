variable "aws_region" {
  description = "AWS region for demo infrastructure."
  type        = string
  default     = "ap-southeast-2"
}

variable "project_name" {
  description = "Project name used for resource names and tags."
  type        = string
  default     = "monorepo-demo"

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.project_name))
    error_message = "project_name must contain only lowercase letters, numbers, and hyphens."
  }
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
  default     = "demo"

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.environment))
    error_message = "environment must contain only lowercase letters, numbers, and hyphens."
  }
}

variable "cloudfront_price_class" {
  description = "CloudFront price class for the demo frontend distribution."
  type        = string
  default     = "PriceClass_100"

  validation {
    condition = contains(
      ["PriceClass_100", "PriceClass_200", "PriceClass_All"],
      var.cloudfront_price_class,
    )
    error_message = "cloudfront_price_class must be PriceClass_100, PriceClass_200, or PriceClass_All."
  }
}

variable "cloudfront_cache_policy_id" {
  description = "Managed CloudFront cache policy ID. Defaults to AWS Managed-CachingOptimized."
  type        = string
  default     = "658327ea-f89d-4fab-a63d-7e88639e58f6"
}

variable "app_runner_api_base_url" {
  description = "Existing App Runner API base URL used by frontend builds during Checkpoint B."
  type        = string
  default     = "https://qvyq3mdegk.ap-southeast-2.awsapprunner.com"

  validation {
    condition     = can(regex("^https://", var.app_runner_api_base_url))
    error_message = "app_runner_api_base_url must be an HTTPS URL."
  }
}

variable "github_repository" {
  description = "GitHub repository allowed to assume the frontend deployment role."
  type        = string
  default     = "finografic/monorepo-demo"

  validation {
    condition     = can(regex("^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$", var.github_repository))
    error_message = "github_repository must use owner/repo format."
  }
}

variable "github_actions_environment" {
  description = "GitHub Actions environment allowed to assume the frontend deployment role."
  type        = string
  default     = "aws-cloudfront"

  validation {
    condition     = can(regex("^[A-Za-z0-9_.-]+$", var.github_actions_environment))
    error_message = "github_actions_environment must contain only letters, numbers, dots, underscores, and hyphens."
  }
}
