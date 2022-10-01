terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = ">=0.8.0"
    }
  }
  upstash = {
    source  = "upstash/upstash"
    version = "1.1.5"
  }



  provider "upstash" {
    email = var.upstash_email
    api_key = var.upstash_api_key
  }
}

provider "vercel" {
  api_token = var.vercel_token
}



