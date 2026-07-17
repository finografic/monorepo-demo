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

variable "cloudfront_api_cache_policy_id" {
  description = "Managed CloudFront cache policy ID for API requests. Defaults to AWS Managed-CachingDisabled."
  type        = string
  default     = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
}

variable "cloudfront_api_origin_request_policy_id" {
  description = "Managed CloudFront origin request policy ID for API requests. Defaults to AWS Managed-AllViewer."
  type        = string
  default     = "216adef6-5c7f-47e4-b989-5492eafa07d3"
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

variable "rds_database_name" {
  description = "Initial PostgreSQL database name."
  type        = string
  default     = "monorepo_demo"

  validation {
    condition     = can(regex("^[A-Za-z][A-Za-z0-9_]{0,62}$", var.rds_database_name))
    error_message = "rds_database_name must start with a letter and contain only letters, numbers, and underscores."
  }
}

variable "rds_master_username" {
  description = "RDS master username."
  type        = string
  default     = "monorepo_demo"

  validation {
    condition     = can(regex("^[A-Za-z][A-Za-z0-9_]{0,62}$", var.rds_master_username))
    error_message = "rds_master_username must start with a letter and contain only letters, numbers, and underscores."
  }
}

variable "rds_instance_class" {
  description = "RDS instance class for the demo PostgreSQL database."
  type        = string
  default     = "db.t4g.micro"
}

variable "rds_engine_version" {
  description = "PostgreSQL engine version for the demo database. Pin this so AWS default major-version changes cannot break the parameter group."
  type        = string
  default     = "17"

  validation {
    condition     = can(regex("^[0-9]+(\\.[0-9]+)?$", var.rds_engine_version))
    error_message = "rds_engine_version must be a major version like 17 or a major.minor version like 17.5."
  }
}

variable "rds_allocated_storage_gb" {
  description = "Initial RDS storage allocation in GiB."
  type        = number
  default     = 20

  validation {
    condition     = var.rds_allocated_storage_gb >= 20
    error_message = "rds_allocated_storage_gb must be at least 20."
  }
}

variable "rds_port" {
  description = "PostgreSQL listener port."
  type        = number
  default     = 5432
}

variable "rds_publicly_accessible" {
  description = "Whether the RDS instance receives a public endpoint. Keep false unless accepting a temporary demo exception."
  type        = bool
  default     = false
}

variable "rds_ingress_cidr_blocks" {
  description = "CIDR blocks allowed to connect to PostgreSQL. Leave empty for private-only access."
  type        = list(string)
  default     = []
}

variable "rds_ingress_security_group_ids" {
  description = "Security group IDs allowed to connect to PostgreSQL, such as a future App Runner VPC connector security group."
  type        = list(string)
  default     = []
}

variable "rds_backup_retention_days" {
  description = "RDS backup retention period in days."
  type        = number
  default     = 0

  validation {
    condition     = var.rds_backup_retention_days >= 0 && var.rds_backup_retention_days <= 35
    error_message = "rds_backup_retention_days must be between 0 and 35."
  }
}

variable "rds_deletion_protection" {
  description = "Whether deletion protection is enabled for the demo database."
  type        = bool
  default     = false
}

variable "rds_skip_final_snapshot" {
  description = "Whether Terraform should skip a final snapshot when destroying the demo database."
  type        = bool
  default     = true
}

variable "ec2_instance_type" {
  description = "EC2 instance type for the low-cost API server."
  type        = string
  default     = "t3.micro"
}

variable "ec2_root_volume_size_gb" {
  description = "Root EBS volume size for the EC2 API server."
  type        = number
  default     = 8

  validation {
    condition     = var.ec2_root_volume_size_gb >= 8
    error_message = "ec2_root_volume_size_gb must be at least 8."
  }
}

variable "ec2_api_port" {
  description = "HTTP port exposed by the EC2 API server."
  type        = number
  default     = 4000
}

variable "ec2_api_ingress_cidr_ipv4" {
  description = "CIDR allowed to reach the EC2 API port. Keep broad until CloudFront origin hardening is added."
  type        = string
  default     = "0.0.0.0/0"
}

variable "ec2_key_name" {
  description = "Optional existing EC2 key pair name for SSH. Leave null to avoid SSH key access."
  type        = string
  default     = null
  nullable    = true
}

variable "ec2_ssh_ingress_cidr_blocks" {
  description = "CIDR blocks allowed to SSH to EC2. Leave empty by default."
  type        = list(string)
  default     = []
}
