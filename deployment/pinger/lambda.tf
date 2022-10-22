terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 2.7.0"
    }
  }
}


variable "region" {
  type = string
}

variable "environment" {
  type        = string
  description = "production or preview"
}

variable "zip" {
  type        = object({
    path = string
    hash = string
  })
  description = "path to the lambda zip path"
}




resource "aws_lambda_function" "check_proxy" {
  function_name    = "check-proxy-${var.region}-${var.environment}"
  description      = "Proxy latency checks from a specific region"
  publish          = true
  filename         = var.zip.path
  # source_code_hash = var.zip.hash

  handler = "main"
  runtime = "go1.x"
  timeout = 10
  memory_size = "1024"





  role = aws_iam_role.lambda_exec.arn


}


resource "aws_lambda_function_url" "url" {
  function_name      = aws_lambda_function.check_proxy.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["*"]
    allow_headers     = ["date", "keep-alive"]
    expose_headers    = ["keep-alive", "date"]
    max_age           = 86400
  }
}

resource "aws_cloudwatch_log_group" "check_proxy" {
  name = "/aws/lambda/${aws_lambda_function.check_proxy.function_name}"

  retention_in_days = 7
}

resource "aws_iam_role" "lambda_exec" {
  name = "check-proxy-${var.region}-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Sid    = ""
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}


output "url" {
  value = aws_lambda_function_url.url
}
