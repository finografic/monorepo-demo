data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_security_group" "api" {
  name        = "${local.name_prefix}-api"
  description = "Controls access to the ${local.name_prefix} EC2 API server."
  vpc_id      = data.aws_vpc.default.id
}

resource "aws_vpc_security_group_ingress_rule" "api_http" {
  security_group_id = aws_security_group.api.id
  cidr_ipv4         = var.ec2_api_ingress_cidr_ipv4
  from_port         = var.ec2_api_port
  ip_protocol       = "tcp"
  to_port           = var.ec2_api_port
}

resource "aws_vpc_security_group_ingress_rule" "api_ssh" {
  for_each = toset(var.ec2_ssh_ingress_cidr_blocks)

  security_group_id = aws_security_group.api.id
  cidr_ipv4         = each.value
  from_port         = 22
  ip_protocol       = "tcp"
  to_port           = 22
}

resource "aws_vpc_security_group_egress_rule" "api_all" {
  security_group_id = aws_security_group.api.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}

resource "aws_vpc_security_group_ingress_rule" "rds_api" {
  security_group_id            = aws_security_group.rds.id
  referenced_security_group_id = aws_security_group.api.id
  from_port                    = var.rds_port
  ip_protocol                  = "tcp"
  to_port                      = var.rds_port
}

data "aws_iam_policy_document" "api_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "api" {
  name               = "${local.name_prefix}-api"
  assume_role_policy = data.aws_iam_policy_document.api_assume_role.json
  description        = "Allows SSM Session Manager access for the ${local.name_prefix} EC2 API host."
}

resource "aws_iam_role_policy_attachment" "api_ssm" {
  role       = aws_iam_role.api.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "api" {
  name = "${local.name_prefix}-api"
  role = aws_iam_role.api.name
}

resource "aws_instance" "api" {
  ami                         = data.aws_ami.amazon_linux_2023.id
  associate_public_ip_address = true
  iam_instance_profile        = aws_iam_instance_profile.api.name
  instance_type               = var.ec2_instance_type
  key_name                    = var.ec2_key_name
  subnet_id                   = local.default_subnet_ids[0]
  vpc_security_group_ids      = [aws_security_group.api.id]

  user_data_replace_on_change = true
  user_data                   = <<-EOT
#!/bin/bash
set -euxo pipefail

dnf update -y
dnf install -y docker git

systemctl enable --now docker

mkdir -p /opt/monorepo-demo
cat >/opt/monorepo-demo/README.txt <<'README'
This host is reserved for the monorepo-demo API.

Phase 6 provisions the low-cost EC2 host and security-group path to RDS.
Phase 7 deploys the Hono server, runtime env, and process manager.
README
EOT

  root_block_device {
    encrypted   = true
    volume_size = var.ec2_root_volume_size_gb
    volume_type = "gp3"
  }

  tags = {
    Name = "${local.name_prefix}-api"
  }
}
