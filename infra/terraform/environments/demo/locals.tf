locals {
  default_subnet_ids = sort(data.aws_subnets.default.ids)
  api_origin_id      = "${var.project_name}-${var.environment}-api-ec2"
  name_prefix        = "${var.project_name}-${var.environment}"
  rds_engine_major   = regex("^([0-9]+)", var.rds_engine_version)[0]
  rds_identifier     = "${local.name_prefix}-postgres"
  s3_origin_id       = "${local.name_prefix}-frontend-s3"

  common_tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
    Project     = var.project_name
  }
}
