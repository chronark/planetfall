terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = ">=0.10.3"
    }
    upstash = {
      source  = "upstash/upstash"
      version = ">=1.2.1"
    }
    aws = {
      source  = "hashicorp/aws"
      version = ">=4.39.0"
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
