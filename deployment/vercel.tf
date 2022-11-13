resource "vercel_project" "web" {
  name      = "planetfall"
  team_id   = var.vercel_team_id
  framework = "nextjs"


  build_command              = "cd ../.. && npx turbo run build --filter=web"
  root_directory             = "svc/web"
  serverless_function_region = "fra1"

  git_repository = {
    repo = "chronark/planetfall"
    type = "github"
  }

  environment = [
    {
      key    = "PINGER_AUTH_TOKEN"
      value  = var.auth_token
      target = ["production", "preview"]

    },
    {
      key    = "NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT"
      value  = "https://vercel-vitals.axiom.co/api/v1/send?configurationId=icfg_oPwbzTXCEWVftFAoGBeNQFKJ&projectId=b5766f87-cc3f-4925-9480-53e74b861789&type=web-vitals"
      target = ["production"]
    },
    {
      key    = "SENDGRID_API_KEY"
      value  = var.sendgrid_api_key
      target = ["production", "preview", "development"]
    },

    {
      key   = "DATABASE_URL",
      value = var.database_url,
    target = ["production", "preview"] },


    {
      key    = "STRIPE_PUBLISHABLE_KEY"
      value  = var.stripe_publishable_key
      target = ["production"]
    },
    {
      key    = "STRIPE_SECRET_KEY"
      value  = var.stripe_secret_key
      target = ["production"]
    },
    {
      key    = "STRIPE_WEBHOOK_SECRET"
      value  = var.stripe_webhook_secret
      target = ["production"]
    },
    {
      key    = "STRIPE_PRODUCT_ID_PRO"
      value  = var.stripe_product_id_pro
      target = ["production"]
    },
    {
      key    = "STRIPE_PRODUCT_ID_PERSONAL"
      value  = var.stripe_product_id_personal
      target = ["production"]
    },
    {
      key    = "TINYBIRD_TOKEN"
      value  = var.tinybird_token
      target = ["production", "preview"]
    },
    {
      key    = "NEXT_PUBLIC_CLERK_FRONTEND_API"
      value  = var.clerk_frontend_api
      target = ["production", "preview"]
    },
    {
      key    = "CLERK_API_KEY"
      value  = var.clerk_api_key
      target = ["production", "preview"]
    },
    {
      key    = "CLERK_JWT_KEY"
      value  = var.clerk_jwt_key
      target = ["production", "preview"]
    },

    {
      key    = "CLERK_WEBHOOK_SECRET"
      value  = var.clerk_webhook_secret
      target = ["production", "preview"]
    }
  ]

}





resource "vercel_dns_record" "sendgrid_url9477" {
  team_id = var.vercel_team_id
  domain  = "planetfall.io"
  name    = "url9477"
  type    = "CNAME"
  ttl     = 60
  value   = "sendgrid.net"
}

resource "vercel_dns_record" "sendgrid_29341690" {
  team_id = var.vercel_team_id
  domain  = "planetfall.io"
  name    = "29341690"
  type    = "CNAME"
  ttl     = 60
  value   = "sendgrid.net"
}

resource "vercel_dns_record" "sendgrid_em4520" {
  team_id = var.vercel_team_id
  domain  = "planetfall.io"
  name    = "em4520"
  type    = "CNAME"
  ttl     = 60
  value   = "u29341690.wl191.sendgrid.net"
}

resource "vercel_dns_record" "sendgrid_s1_domainkey" {
  team_id = var.vercel_team_id
  domain  = "planetfall.io"
  name    = "s1._domainkey"
  type    = "CNAME"
  ttl     = 60
  value   = "s1.domainkey.u29341690.wl191.sendgrid.net"
}
resource "vercel_dns_record" "sendgrid_s2_domainkey" {
  team_id = var.vercel_team_id
  domain  = "planetfall.io"
  name    = "s2._domainkey"
  type    = "CNAME"
  ttl     = 60
  value   = "s2.domainkey.u29341690.wl191.sendgrid.net"
}


resource "vercel_dns_record" "accounts" {
  team_id = var.vercel_team_id
  domain  = "planetfall.io"
  name    = "accounts"
  type    = "CNAME"
  ttl     = 60
  value   = "accounts.clerk.services"
}


resource "vercel_dns_record" "clerk" {
  team_id = var.vercel_team_id
  domain  = "planetfall.io"
  name    = "clerk"
  type    = "CNAME"
  ttl     = 60
  value   = "frontend-api.clerk.services"
}


resource "vercel_dns_record" "clk_domainkey" {
  team_id = var.vercel_team_id
  domain  = "planetfall.io"
  name    = "clk._domainkey"
  type    = "CNAME"
  ttl     = 60
  value   = "dkim1.n726fkhumtvm.clerk.services"
}



resource "vercel_dns_record" "clk2_domainkey" {
  team_id = var.vercel_team_id
  domain  = "planetfall.io"
  name    = "clk2._domainkey"
  type    = "CNAME"
  ttl     = 60
  value   = "dkim2.n726fkhumtvm.clerk.services"
}



resource "vercel_dns_record" "clkmail" {
  team_id = var.vercel_team_id
  domain  = "planetfall.io"
  name    = "clkmail"
  type    = "CNAME"
  ttl     = 60
  value   = "dkim2.n726fkhumtvm.clerk.services"
}





resource "vercel_project_domain" "web" {
  project_id = vercel_project.web.id
  team_id    = var.vercel_team_id
  domain     = "planetfall.io"
}

resource "vercel_project_domain" "wildcard" {
  project_id = vercel_project.web.id
  team_id    = var.vercel_team_id
  domain     = "*.planetfall.io"
}






data "vercel_project_directory" "planetfall" {
  path = "../"
}

resource "vercel_deployment" "web" {
  project_id  = vercel_project.web.id
  team_id     = var.vercel_team_id
  files       = data.vercel_project_directory.planetfall.files
  path_prefix = data.vercel_project_directory.planetfall.path
  production  = true


}