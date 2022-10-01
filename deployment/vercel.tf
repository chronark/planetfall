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

    }
  ]
}


resource "vercel_project_domain" "pinger" {
  for_each   = vercel_project.pinger
  project_id = each.value.id
  team_id = var.vercel_team_id
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
      key    = "NEXT_PUBLIC_CLERK_FRONTEND_API"
      value  = "clerk.planetfall.io"
      target = ["production", "preview", "development"]
    },
    {
      key    = "CLERK_API_KEY"
      value  = var.clerk_api_key
      target = ["production", "preview", "development"]
    },
    {
      key   = "DATABASE_URL",
      value = var.database_url,
    target = ["production", "preview"] },

  ]

}

resource "vercel_dns_record" "clkmail" {
  team_id = var.vercel_team_id
  domain  = "planetfall.io"
  name    = "clkmail"
  type    = "CNAME"
  ttl     = 60
  value   = "mail.n726fkhumtvm.clerk.services"
}

resource "vercel_dns_record" "clk2" {
  team_id = var.vercel_team_id
  domain  = "planetfall.io"
  name    = "clk2._domainkey"
  type    = "CNAME"
  ttl     = 60
  value   = "dkim2.n726fkhumtvm.clerk.services"
}

resource "vercel_dns_record" "clk" {
  team_id = var.vercel_team_id
  domain  = "planetfall.io"
  name    = "clk._domainkey"
  type    = "CNAME"
  ttl     = 60
  value   = "dkim1.n726fkhumtvm.clerk.services"
}

resource "vercel_dns_record" "clerk" {
  team_id = var.vercel_team_id
  domain  = "planetfall.io"
  name    = "clerk"
  type    = "CNAME"
  ttl     = 60
  value   = "frontend-api.clerk.services"
}
resource "vercel_dns_record" "accounts" {
  team_id = var.vercel_team_id
  domain  = "planetfall.io"
  name    = "accounts"
  type    = "CNAME"
  ttl     = 60
  value   = "accounts.clerk.services"
}
resource "vercel_project_domain" "web" {
  project_id = vercel_project.web.id
  team_id    = var.vercel_team_id
  domain     = "planetfall.io"
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




