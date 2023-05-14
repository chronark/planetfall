

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


variable "stripe_price_id_checks" {
  type = string
}



variable "axiom_token" {
  type      = string
  sensitive = true
}



variable "axiom_org" {
  type      = string
  sensitive = true
}



variable "tinybird_token" {
  type      = string
  sensitive = true
}



variable "git_credentials" {
  type      = string
  sensitive = true

}

variable "fly_token" {
  type      = string
  sensitive = true

}

variable "fly_org" {
  type    = string
  default = "planetfall"
}


variable "resend_api_key" {
  type      = string
  sensitive = true
}

variable "clerk_secret_key" {
  type = object({
    production  = string
    preview     = string
    development = string
  })
  sensitive = true
}


variable "clerk_publishable_key" {
  type = object({
    production  = string
    preview     = string
    development = string

  })

}
variable "clerk_webhook_secret" {
  type = object({
    production  = string
    preview     = string
    development = string
  })
  sensitive = true
}

variable "plain_app_key" {
  type      = string
  sensitive = true
}

variable "highstorm_token" {
  type      = string
  sensitive = true
}

variable "check_runner_signing_keys" {
  type = object({
    private = string
    public  = string
  })
  sensitive = true
}
