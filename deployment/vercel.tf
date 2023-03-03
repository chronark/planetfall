resource "vercel_project" "web" {
  name      = "planetfall"
  team_id   = var.vercel_team_id
  framework = "nextjs"


  build_command              = "cd ../.. && pnpm turbo run build --filter=web"
  root_directory             = "apps/web"
  serverless_function_region = "fra1"

  git_repository = {
    repo = "chronark/planetfall"
    type = "github"
  }

  environment = [
    {
      key    = "UPSTASH_KAFKA_REST_URL"
      value  = upstash_kafka_cluster.planetfall.rest_endpoint
      target = ["production", "preview"]
    },
    {
      key    = "UPSTASH_KAFKA_REST_USERNAME"
      value  = upstash_kafka_cluster.planetfall.username
      target = ["production", "preview"]
    },
    {
      key    = "UPSTASH_KAFKA_REST_PASSWORD"
      value  = upstash_kafka_cluster.planetfall.password
      target = ["production", "preview"]
    },
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
      key    = "STRIPE_PRICE_ID_CHECKS"
      value  = var.stripe_price_id_checks
      target = ["production"]
    },

    {
      key    = "TINYBIRD_TOKEN"
      value  = var.tinybird_token
      target = ["production", "preview"]
    },
    {
      key    = "GITHUB_OAUTH_ID"
      value  = var.github_oauth_id
      target = ["production"]
    },
    {
      key    = "GITHUB_OAUTH_SECRET"
      value  = var.github_oauth_secret
      target = ["production"]
    },
    {
      key : "NEXTAUTH_SECRET",
      value : var.nextauth_secret,
      target : ["production"]
    },
    {
      key    = "NEXTAUTH_SECRET"
      value  = var.nextauth_secret_preview
      target = ["preview"]
      }, {
      key    = "UPSTASH_REDIS_REST_URL"
      value  = "https:${upstash_redis_database.planetfall.endpoint}"
      target = ["production", "preview", "development"]
      }, {
      key    = "UPSTASH_REDIS_REST_TOKEN"
      value  = upstash_redis_database.planetfall.rest_token
      target = ["production", "preview", "development"]
    },
    {
      key    = "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
      value  = var.clerk_publishable_key.production
      target = ["production"]
    },
    {
      key    = "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
      value  = var.clerk_publishable_key.preview
      target = ["preview"]
    },
{
      key    = "CLERK_SECRET_KEY"
      value  = var.clerk_secret_key.production
      target = ["production"]
    },
    {
      key    = "CLERK_SECRET_KEY"
      value  = var.clerk_secret_key.preview
      target = ["preview"]
    },


  ]

}




resource "vercel_dns_record" "proton_verification" {
  team_id = var.vercel_team_id
  domain  = vercel_project_domain.planetfall_io.domain
  name    = "" # Should be "@"
  type    = "TXT"
  ttl     = 60
  value   = var.proton_verification
}


resource "vercel_dns_record" "proton_mail" {
  team_id     = var.vercel_team_id
  domain      = vercel_project_domain.planetfall_io.domain
  name        = "" # Should be "@"
  type        = "MX"
  ttl         = 60
  mx_priority = 10
  value       = "mail.protonmail.ch"
}


resource "vercel_dns_record" "proton_spf" {
  team_id = var.vercel_team_id
  domain  = vercel_project_domain.planetfall_io.domain
  name    = "" # Should be "@"
  type    = "TXT"
  ttl     = 60
  value   = var.proton_spf
}
resource "vercel_dns_record" "proton_domainkey" {
  team_id = var.vercel_team_id
  domain  = vercel_project_domain.planetfall_io.domain
  name    = "protonmail._domainkey"
  type    = "CNAME"
  ttl     = 60
  value   = var.proton_domainkey
}

resource "vercel_dns_record" "proton_domainkey2" {
  team_id = var.vercel_team_id
  domain  = vercel_project_domain.planetfall_io.domain
  name    = "protonmail2._domainkey"
  type    = "CNAME"
  ttl     = 60
  value   = var.proton_domainkey2
}

resource "vercel_dns_record" "proton_domainkey3" {
  team_id = var.vercel_team_id
  domain  = vercel_project_domain.planetfall_io.domain
  name    = "protonmail3._domainkey"
  type    = "CNAME"
  ttl     = 60
  value   = var.proton_domainkey3
}

resource "vercel_dns_record" "proton_dmarc" {
  team_id = var.vercel_team_id
  domain  = vercel_project_domain.planetfall_io.domain
  name    = "_dmarc"
  type    = "TXT"
  ttl     = 60
  value   = var.proton_dmarc
}

resource "vercel_dns_record" "proton_mailsec" {
  team_id     = var.vercel_team_id
  domain      = vercel_project_domain.planetfall_io.domain
  name        = "" # Should be "@"
  type        = "MX"
  ttl         = 60
  mx_priority = 20
  value       = "mailsec.protonmail.ch"
}


resource "vercel_dns_record" "resend_spf_mx" {
  team_id     = var.vercel_team_id
  domain      = vercel_project_domain.planetfall_io.domain
  name        = "bounces"
  type        = "MX"
  ttl         = 60
  mx_priority = 10
  value       = "feedback-smtp.us-east-1.amazonses.com"
}


resource "vercel_dns_record" "resend_spf_txt" {
  team_id = var.vercel_team_id
  domain  = vercel_project_domain.planetfall_io.domain
  name    = "bounces"
  type    = "TXT"
  ttl     = 60
  value   = "v=spf1 include:amazonses.com ~all"
}




resource "vercel_dns_record" "resend_dkim_iorec6tevdstuzig7tc2dfv622slyyuu" {
  team_id = var.vercel_team_id
  domain  = vercel_project_domain.planetfall_io.domain
  name    = "iorec6tevdstuzig7tc2dfv622slyyuu._domainkey"
  type    = "CNAME"
  ttl     = 60
  value   = "iorec6tevdstuzig7tc2dfv622slyyuu.dkim.amazonses.com"
}

resource "vercel_dns_record" "resend_dkim_m4qxxdawi5spoqhbboa3xwa7eobpua3m" {
  team_id = var.vercel_team_id
  domain  = vercel_project_domain.planetfall_io.domain
  name    = "m4qxxdawi5spoqhbboa3xwa7eobpua3m._domainkey"
  type    = "CNAME"
  ttl     = 60
  value   = "m4qxxdawi5spoqhbboa3xwa7eobpua3m.dkim.amazonses.com"
}
resource "vercel_dns_record" "resend_dkim_wutpcga6f4p5krwq77swg5q6gg6qcuqo" {
  team_id = var.vercel_team_id
  domain  = vercel_project_domain.planetfall_io.domain
  name    = "wutpcga6f4p5krwq77swg5q6gg6qcuqo._domainkey"
  type    = "CNAME"
  ttl     = 60
  value   = "wutpcga6f4p5krwq77swg5q6gg6qcuqo.dkim.amazonses.com"
}





resource "vercel_dns_record" "clerk_accounts" {
  team_id = var.vercel_team_id
  domain  = vercel_project_domain.planetfall_io.domain
  name    = "accounts"
  type    = "CNAME"
  ttl     = 60
  value   = "accounts.clerk.services"
}


resource "vercel_dns_record" "clerk_frontend_api" {
  team_id = var.vercel_team_id
  domain  = vercel_project_domain.planetfall_io.domain
  name    = "clerk"
  type    = "CNAME"
  ttl     = 60
  value   = "frontend-api.clerk.services"
}



resource "vercel_dns_record" "clerk_clk2_domainkey" {
  team_id = var.vercel_team_id
  domain  = vercel_project_domain.planetfall_io.domain
  name    = "clk._domainkey"
  type    = "CNAME"
  ttl     = 60
  value   = "dkim1.n726fkhumtvm.clerk.services"
}





resource "vercel_dns_record" "clerk_clk_domainkey" {
  team_id = var.vercel_team_id
  domain  = vercel_project_domain.planetfall_io.domain
  name    = "clk2._domainkey"
  type    = "CNAME"
  ttl     = 60
  value   = "dkim2.n726fkhumtvm.clerk.services"
}




resource "vercel_dns_record" "clerk_clkmail" {
  team_id = var.vercel_team_id
  domain  = vercel_project_domain.planetfall_io.domain
  name    = "clkmail"
  type    = "CNAME"
  ttl     = 60
  value   = "mail.n726fkhumtvm.clerk.services"
}









resource "vercel_project_domain" "planetfall_io" {
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
#   path = "../"
# }


# resource "vercel_deployment" "planetfall" {
#   project_id  = vercel_project.web.id
#   team_id     = var.vercel_team_id
#   files       = data.vercel_project_directory.root.files
#   path_prefix = data.vercel_project_directory.root.path
# }


