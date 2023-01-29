
# resource "aws_ecr_repository" "scheduler" {
#   name                 = "scheduler"
#   image_tag_mutability = "IMMUTABLE"
#   image_scanning_configuration {
#     scan_on_push = true
#   }
# }



# resource "aws_ecr_lifecycle_policy" "retention" {
#   repository = aws_ecr_repository.scheduler.name
#   policy     = <<EOF
# {
#     "rules": [
#         {
#             "rulePriority": 1,
#             "description": "Expire images older than 7 days",
#             "selection": {
#                 "tagStatus": "any",
#                 "countType": "sinceImagePushed",
#                 "countUnit": "days",
#                 "countNumber": 7
#             },
#             "action": {
#                 "type": "expire"
#             }
#         }
#     ]
# }
# EOF
# }


# resource "aws_ecs_cluster" "planetfall" {
#   name = "planetfall"
# }

# resource "aws_ecs_task_definition" "scheduler" {
#   family                   = "service"
#   requires_compatibilities = ["FARGATE"]
#   network_mode             = "awsvpc"

#   cpu    = 256
#   memory = 512

#   container_definitions = jsonencode([
#     {

#       name      = "scheduler"
#       image     = "${aws_ecr_repository.scheduler.repository_url}:latest"
#       cpu       = 256
#       memory    = 512
#       essential = true
#       log_configuration = {
#         log_driver = "awslogs"
#         options = {
#           "awslogs-group"         = aws_cloudwatch_log_group.scheduler.name
#           "awslogs-region"        = "eu-central-1"
#           "awslogs-stream-prefix" = "scheduler"
#         }
#       }
#       environment = [
#         {
#           name  = "UPSTASH_REDIS_REST_TOKEN",
#           value = upstash_redis_database.planetfall.rest_token
#         },
#         {
#           name  = "UPSTASH_REDIS_REST_URL",
#           value = "https://${upstash_redis_database.planetfall.endpoint}"
#         },
#         {
#           name  = "KAFKA_BROKER",
#           value = "${upstash_kafka_cluster.planetfall.tcp_endpoint}:9092"
#         },
#         {
#           name  = "KAFKA_USERNAME",
#           value = upstash_kafka_cluster.planetfall.username
#         },
#         {
#           name  = "KAFKA_PASSWORD",
#           value = upstash_kafka_cluster.planetfall.password
#         },
#         {
#           name  = "AXIOM_TOKEN",
#           value = var.axiom_token
#         },
#         {
#           name  = "TINYBIRD_TOKEN",
#           value = var.tinybird_token
#         },
#         {
#           name  = "DATABASE_URL",
#           value = var.database_url
#         },
#         {
#           name  = "SENDGRID_API_KEY",
#           value = var.sendgrid_api_key
#         },
#         {
#           name  = "STRIPE_SECRET_KEY",
#           value = var.stripe_secret_key
#         }
#       ]
#     }


#   ])

#   execution_role_arn = aws_iam_role.scheduler_task_execution_role.arn
# }
# resource "aws_iam_role" "scheduler_task_execution_role" {
#   name               = "scheduler-task-execution-role"
#   assume_role_policy = data.aws_iam_policy_document.ecs_task_assume_role.json
# }

# data "aws_iam_policy_document" "ecs_task_assume_role" {
#   statement {
#     actions = ["sts:AssumeRole"]

#     principals {
#       type        = "Service"
#       identifiers = ["ecs-tasks.amazonaws.com"]
#     }
#   }
# }
# data "aws_iam_policy" "ecs_task_execution_role" {
#   arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
# }

# # Attach the above policy to the execution role.
# resource "aws_iam_role_policy_attachment" "ecs_task_execution_role" {
#   role       = aws_iam_role.scheduler_task_execution_role.name
#   policy_arn = data.aws_iam_policy.ecs_task_execution_role.arn
# }

# resource "aws_cloudwatch_log_group" "scheduler" {
#   name = "scheduler"

#   tags = {
#     Environment = "production"
#     Application = "scheduler"
#   }
# }


# resource "aws_ecs_service" "scheduler" {
#   name                = "scheduler"
#   cluster             = aws_ecs_cluster.planetfall.id
#   task_definition     = aws_ecs_task_definition.scheduler.arn
#   desired_count       = 1
#   launch_type         = "FARGATE"
#   scheduling_strategy = "REPLICA"
#   network_configuration {

#     assign_public_ip = true
#     security_groups = [
#       aws_security_group.egress_all.id,
#       aws_security_group.ingress_api.id
#     ]
#     subnets = [
#       aws_subnet.public.id,
#     ]
#   }
# }


locals {
  region = "eu-central-1"
}


module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "3.19.0"

  name = "default"
  cidr = "10.0.0.0/16"

  azs             = ["${local.region}a", "${local.region}b", "${local.region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_ipv6 = true

  enable_nat_gateway = false
  single_nat_gateway = false

  public_subnet_tags = {
    Name = "overridden-name-public"
  }

  public_subnet_tags_per_az = {
    "${local.region}a" = {
      "availability-zone" = "${local.region}a"
    }
  }


  vpc_tags = {
    Name = "vpc-name"
  }
}

module "ecr" {
  source               = "terraform-aws-modules/ecr/aws"
  version              = "1.5.1"
  repository_name      = "scheduler"

  repository_lifecycle_policy = <<EOF
{
    "rules": [
        {
            "rulePriority": 1,
            "description": "Expire images older than 7 days",
            "selection": {
                "tagStatus": "any",
                "countType": "sinceImagePushed",
                "countUnit": "days",
                "countNumber": 7
            },
            "action": {
                "type": "expire"
            }
        }
    ]
}
EOF

}


resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/aws/ecs/scheduler"
  retention_in_days = 7

}
module "ecs" {
  source       = "terraform-aws-modules/ecs/aws"
  version      = "4.1.3"
  cluster_name = "tf-ecs-cluster"
  cluster_configuration = {
    execute_command_configuration = {
      logging = "OVERRIDE"
      log_configuration = {
        cloud_watch_log_group_name = aws_cloudwatch_log_group.ecs.name
      }
    }
  }
    fargate_capacity_providers = {
    FARGATE = {
      default_capacity_provider_strategy = {
        weight = 50
        base   = 20
      }
    }
    FARGATE_SPOT = {
      default_capacity_provider_strategy = {
        weight = 50
      }
    }
  }
}

resource "aws_ecs_task_definition" "scheduler" {
  family = "hello_world"

  
  container_definitions = <<EOF
[
  {
    "name": "scheduler",
    "image": "hello-world",
    "cpu": 0,
    "memory": 128,
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-region": "eu-west-1",
        "awslogs-group": "${aws_cloudwatch_log_group.ecs.name}",
        "awslogs-stream-prefix": "ec2"
      }
    }
  }
]
EOF
}


resource "aws_ecs_service" "scheduler" {
  name            = "hello_world"
  cluster         = module.ecs.cluster_id
  task_definition = aws_ecs_task_definition.scheduler.arn
  launch_type = "FARGATE"
  desired_count = 1

  deployment_maximum_percent         = 100
  deployment_minimum_healthy_percent = 0
}