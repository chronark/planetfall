
resource "aws_ecr_repository" "scheduler" {
  name = "planetfall/scheduler"
  image_tag_mutability = "IMMUTABLE"
}




resource "aws_ecs_cluster" "planetfall" {
  name = "planetfall"
}

resource "aws_ecs_task_definition" "scheduler" {
  family = "scheduler"
  container_definitions = jsonencode([
    {
      "name" : "scheduler",
      "image" : aws_ecr_repository.scheduler.repository_url,
      "essential" : true,
      environment: [
        {
          name: "DATABASE_URL",
          value: var.database_url
        }
      ],
      "memory" : 512,
      "cpu" : 256
    }
  ])
  requires_compatibilities = ["FARGATE"] # Stating that we are using ECS Fargate
  network_mode             = "awsvpc"    # Using awsvpc as our network mode as this is required for Fargate
  memory                   = 512         # Specifying the memory our container requires
  cpu                      = 256         # Specifying the CPU our container requires
  execution_role_arn       = aws_iam_role.ecsTaskExecutionRole.arn
}

resource "aws_iam_role" "ecsTaskExecutionRole" {
  name               = "ecsTaskExecutionRole"
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


resource "aws_ecs_service" "scheduler" {
  name            = "scheduler"
  cluster         = aws_ecs_cluster.planetfall.id
  task_definition = aws_ecs_task_definition.scheduler.arn
  launch_type     = "FARGATE"
  desired_count   = 1
  force_new_deployment = true
  deployment_circuit_breaker {
    enable = true
    rollback = true
  }

  network_configuration {
    subnets          = ["${aws_default_subnet.default_subnet_a.id}", "${aws_default_subnet.default_subnet_b.id}", "${aws_default_subnet.default_subnet_c.id}"]
    assign_public_ip = false
  }
}

# Providing a reference to our default VPC
resource "aws_default_vpc" "default_vpc" {
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
