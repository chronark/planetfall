

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


variable "vercel_regions" {
  type = set(string)
  default = [
    "arn1",
    "bom1",
    "cdg1",
    "cle1",
    "cpt1",
    "dub1",
    "fra1",
    "gru1",
    "hkg1",
    "hnd1",
     "iad1",
     "icn1",
     "kix1",
     "lhr1",
     "pdx1",
     "sfo1",
     "sin1",
     "syd1",
  ]
}

variable "upstash_email" {
  type =string
  sensitive = true
}
variable "upstash_api_key" {
  type =string
  sensitive = true
}

variable "stripe_webhook_secret"{
  type=string
  sensitive = true
}


variable "stripe_secret_key"{
  type=string
  sensitive = true
}


variable "stripe_publishable_key" {
  type=string
}

variable "stripe_plan_pro_price_id" {
  type=string
}
