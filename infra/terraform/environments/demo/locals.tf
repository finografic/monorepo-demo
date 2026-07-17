locals {
  name_prefix    = "${var.project_name}-${var.environment}"
  rds_identifier = "${local.name_prefix}-postgres"
  s3_origin_id   = "${local.name_prefix}-frontend-s3"

  common_tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
    Project     = var.project_name
  }
}
