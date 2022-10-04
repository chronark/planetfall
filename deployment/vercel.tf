resource "vercel_project" "pinger" {
  for_each                   = var.vercel_regions
  name                       = "pinger-${each.value}"
  team_id                    = var.vercel_team_id
  serverless_function_region = each.value
  framework                  = "nextjs"


  git_repository = {
    repo = "chronark/planetfall"
    type = "github"
  }

  build_command  = "cd ../.. && npx turbo run build --filter=pinger"
  root_directory = "svc/pinger"

  environment = [
    {
      key    = "AUTH_TOKEN"
      value  = var.auth_token
      target = ["production", "preview"]

    },
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
      key    = "STRIPE_PLAN_PRO_PRICE_ID"
      value  = var.stripe_plan_pro_price_id
      target = ["production"]
    },



  ]
}


resource "vercel_project_domain" "pinger" {
  for_each   = vercel_project.pinger
  project_id = each.value.id
  team_id    = var.vercel_team_id
  domain     = "planetfall-pinger-${each.value.serverless_function_region}.vercel.app"
}





resource "vercel_project" "web" {
  name      = "planetfall"
  team_id   = var.vercel_team_id
  framework = "nextjs"


  build_command  = "cd ../.. && npx turbo run build --filter=web"
  root_directory = "svc/web"

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
      key   = "DATABASE_URL",
      value = var.database_url,
    target = ["production", "preview"] },

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


# data "vercel_project_directory" "root" {
#   path = ".."

# }

# resource "vercel_deployment" "pinger" {
#   for_each    = vercel_project.pinger
#   project_id  = each.value.id
#   files       = data.vercel_project_directory.root.files
#   path_prefix = data.vercel_project_directory.root.path
#   production  = true
#   team_id = var.vercel_team_id
# }




