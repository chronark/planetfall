terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = ">=0.11.4"
    }
    upstash = {
      source  = "upstash/upstash"
      version = ">=1.2.1"
    }

    aws = {
      source  = "hashicorp/aws"
      version = ">=4.52.0"
    }
    fly = {
      source  = "fly-apps/fly"
      version = ">=0.0.20"
    }
  }
}





provider "upstash" {
  email   = var.upstash_email
  api_key = var.upstash_api_key
}


provider "vercel" {
  api_token = var.vercel_token
}



provider "fly" {
  fly_api_token        = var.fly_token
  useinternaltunnel    = true
  internaltunnelorg    = var.fly_org
  internaltunnelregion = "fra"
}
