data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

resource "aws_db_subnet_group" "postgres" {
  name        = "${local.name_prefix}-postgres"
  description = "Subnet group for the ${local.name_prefix} PostgreSQL database."
  subnet_ids  = data.aws_subnets.default.ids
}

resource "aws_security_group" "rds" {
  name        = "${local.name_prefix}-rds"
  description = "Controls inbound PostgreSQL access for ${local.name_prefix}."
  vpc_id      = data.aws_vpc.default.id
}

resource "aws_vpc_security_group_ingress_rule" "rds_cidr" {
  for_each = toset(var.rds_ingress_cidr_blocks)

  security_group_id = aws_security_group.rds.id
  cidr_ipv4         = each.value
  from_port         = var.rds_port
  ip_protocol       = "tcp"
  to_port           = var.rds_port
}

resource "aws_vpc_security_group_ingress_rule" "rds_security_group" {
  for_each = toset(var.rds_ingress_security_group_ids)

  security_group_id            = aws_security_group.rds.id
  referenced_security_group_id = each.value
  from_port                    = var.rds_port
  ip_protocol                  = "tcp"
  to_port                      = var.rds_port
}

resource "aws_db_parameter_group" "postgres" {
  name        = "${local.name_prefix}-postgres17"
  description = "PostgreSQL parameter group for ${local.name_prefix}."
  family      = "postgres17"
}

resource "random_password" "rds_master" {
  length  = 32
  special = false
}

resource "aws_db_instance" "postgres" {
  identifier = local.rds_identifier

  engine         = "postgres"
  instance_class = var.rds_instance_class

  allocated_storage = var.rds_allocated_storage_gb
  storage_encrypted = true
  storage_type      = "gp2"

  db_name  = var.rds_database_name
  username = var.rds_master_username
  password = var.rds_manage_master_user_password ? null : random_password.rds_master.result
  port     = var.rds_port

  manage_master_user_password = var.rds_manage_master_user_password

  db_subnet_group_name   = aws_db_subnet_group.postgres.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = var.rds_publicly_accessible

  backup_retention_period = var.rds_backup_retention_days
  copy_tags_to_snapshot   = true
  deletion_protection     = var.rds_deletion_protection
  skip_final_snapshot     = var.rds_skip_final_snapshot

  auto_minor_version_upgrade = true
  apply_immediately          = false

  parameter_group_name = aws_db_parameter_group.postgres.name
}
