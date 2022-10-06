

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

variable "stripe_plan_pro_price_id" {
  type = string
}

variable "iron_session_secret" {
  type      = string
  sensitive = true
}


variable "sendgrid_api_key" {
  type      = string
  sensitive = true
}



variable "axiom_token" {
  type      = string
  sensitive = true
}


