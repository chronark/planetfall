

variable "auth_token" {
  type      = string
  sensitive = true
}
variable "vercel_token" {
  type      = string
  sensitive = true
}

variable "vercel_team_id" {
  type = string
}

variable "database_url" {
  type      = string
  sensitive = true
}



variable "upstash_email" {
  type      = string
  sensitive = true
}
variable "upstash_api_key" {
  type      = string
  sensitive = true
}

variable "stripe_webhook_secret" {
  type      = string
  sensitive = true
}


variable "stripe_secret_key" {
  type      = string
  sensitive = true
}


variable "stripe_publishable_key" {
  type = string
}

variable "stripe_product_id_pro" {
  type = string
}

variable "stripe_product_id_personal" {
  type = string
}


variable "sendgrid_api_key" {
  type      = string
  sensitive = true
}



variable "axiom_token" {
  type      = string
  sensitive = true
}



variable "tinybird_token" {
  type = string
  sensitive = true
}


variable "clerk_frontend_api" {
  type = string
  sensitive = true
}


variable "clerk_api_key" {
  type = string
  sensitive = true
}


variable "clerk_jwt_key" {
  type = string
  sensitive = true
}

variable "clerk_webhook_secret" {
  type = string
  sensitive = true
}