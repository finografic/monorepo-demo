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
