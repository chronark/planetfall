
resource "aws_ecr_repository" "scheduler" {
  name                 = "planetfall/scheduler"
  image_tag_mutability = "MUTABLE"
}


resource "aws_ecr_lifecycle_policy" "expire_1_day" {
  repository = aws_ecr_repository.scheduler.name

  policy = <<EOF
{
    "rules": [
        {
            "rulePriority": 1,
            "description": "Expire images older than 1 day",
            "selection": {
                "tagStatus": "any",
                "countType": "sinceImagePushed",
                "countUnit": "days",
                "countNumber": 1
            },
            "action": {
                "type": "expire"
            }
        }
    ]
}
EOF
}


resource "aws_ecs_cluster" "planetfall" {
  name = "planetfall"
}

resource "aws_ecs_task_definition" "scheduler" {
  depends_on = [
    aws_cloudwatch_log_group.logs
  ]
  family = "scheduler"
  container_definitions = jsonencode([
    {
      name : "scheduler",
      image : aws_ecr_repository.scheduler.repository_url,
      environment : [
        {
          name : "DATABASE_URL",
          value : var.database_url
        },
        {
          name : "PORT",
          value : "8000"
        },
        {
          name : "AXIOM_TOKEN",
          value : var.axiom_token
        }
      ],
      "logConfiguration" : {
        "logDriver" : "awslogs",
        "options" : {
          "awslogs-group" : "/ecs/scheduler",
          "awslogs-region" : "us-east-1",
          "awslogs-stream-prefix" : "ecs"
        }
      }
      # memory : 1024,
      # cpu : 512,
      healthCheck : {
        command : ["CMD-SHELL", "curl http://localhost:8000"]
        interval : 10
      }
    }
  ])
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  memory                   = 1024
  cpu                      = 512
  execution_role_arn       = aws_iam_role.ecsTaskExecutionRole.arn
  task_role_arn            = aws_iam_role.app_role.arn

}
resource "aws_ecs_service" "scheduler" {
  name            = "scheduler"
  cluster         = aws_ecs_cluster.planetfall.id
  task_definition = aws_ecs_task_definition.scheduler.arn
  launch_type     = "FARGATE"
  desired_count   = 1

  force_new_deployment = true
  # deployment_circuit_breaker {
  #   enable   = true
  #   rollback = true
  # }

  network_configuration {
    subnets = [
      aws_default_subnet.default_subnet_a.id,
      aws_default_subnet.default_subnet_b.id,
      aws_default_subnet.default_subnet_c.id,
    ]

    assign_public_ip = true
  }
}

# Providing a reference to our default subnets
resource "aws_default_subnet" "default_subnet_a" {
  availability_zone = "us-east-1a"
}

resource "aws_default_subnet" "default_subnet_b" {
  availability_zone = "us-east-1b"
}

resource "aws_default_subnet" "default_subnet_c" {
  availability_zone = "us-east-1c"
}





# https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_execution_IAM_role.html
resource "aws_iam_role" "ecsTaskExecutionRole" {
  name               = "ecs-scheduler-execution"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json
}

data "aws_iam_policy_document" "assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}


resource "aws_iam_role_policy_attachment" "ecsTaskExecutionRole_policy" {
  role       = aws_iam_role.ecsTaskExecutionRole.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}


resource "aws_cloudwatch_log_group" "logs" {
  name              = "/ecs/scheduler"
  retention_in_days = 1
}



# creates an application role that the container/task runs as
resource "aws_iam_role" "app_role" {
  name               = "ecs-scheduler-task"
  assume_role_policy = data.aws_iam_policy_document.app_role_assume_role_policy.json
}

# assigns the app policy
resource "aws_iam_role_policy" "app_policy" {
  name   = "ecs-scheduler"
  role   = aws_iam_role.app_role.id
  policy = data.aws_iam_policy_document.app_policy.json
}

# TODO: fill out custom policy
data "aws_iam_policy_document" "app_policy" {
  statement {
    actions = [
      "ecs:DescribeClusters",
    ]

    resources = [
      aws_ecs_cluster.planetfall.arn,
    ]
  }
}

data "aws_caller_identity" "current" {
}

# allow role to be assumed by ecs and local saml users (for development)
data "aws_iam_policy_document" "app_role_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }

    # principals {
    #   type = "AWS"

    #   identifiers = [
    #     "arn:aws:sts::${data.aws_caller_identity.current.account_id}:assumed-role/${var.saml_role}/me@example.com",
    #   ]
    # }
  }
}