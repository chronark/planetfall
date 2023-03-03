

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


variable "github_oauth_id" {
  type = string
}



variable "github_oauth_secret" {
  type      = string
  sensitive = true
}



variable "nextauth_secret" {
  type      = string
  sensitive = true
}

variable "nextauth_secret_preview" {
  type      = string
  sensitive = true
}

variable "proton_verification" {
  type      = string
  sensitive = true
}
variable "proton_spf" {
  type      = string
  sensitive = true
}


variable "proton_domainkey" {
  type      = string
  sensitive = true
}
variable "proton_domainkey2" {
  type      = string
  sensitive = true
}
variable "proton_domainkey3" {
  type      = string
  sensitive = true
}
variable "proton_dmarc" {
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



variable "clerk_publishable_key" {
  type = object({
    production = string
    preview    = string
  })

}

variable "clerk_secret_key" {
  type = object({
    production = string
    preview    = string
  })
  sensitive = true

}
