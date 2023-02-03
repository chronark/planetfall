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
      key    = "STRIPE_PRICE_ID_PRO"
      value  = var.stripe_price_id_pro
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
      key    = "NEXTAUTH_SECRET"
      value  = var.nextauth_secret
      target = ["production"]
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
      key    = "SENDGRID_API_KEY"
      value  = var.sendgrid_api_key
      target = ["production", "preview", "development"]
    },


  ]

}




resource "vercel_dns_record" "proton_verification" {
  team_id = var.vercel_team_id
  domain  = "planetfall.io"
  name    = "" # Should be "@"
  type    = "TXT"
  ttl     = 60
  value   = var.proton_verification
}


resource "vercel_dns_record" "proton_mail" {
  team_id     = var.vercel_team_id
  domain      = "planetfall.io"
  name        = "" # Should be "@"
  type        = "MX"
  ttl         = 60
  mx_priority = 10
  value       = "mail.protonmail.ch"
}


resource "vercel_dns_record" "proton_spf" {
  team_id = var.vercel_team_id
  domain  = "planetfall.io"
  name    = "" # Should be "@"
  type    = "TXT"
  ttl     = 60
  value   = var.proton_spf
}
resource "vercel_dns_record" "proton_domainkey" {
  team_id = var.vercel_team_id
  domain  = "planetfall.io"
  name    = "protonmail._domainkey"
  type    = "CNAME"
  ttl     = 60
  value   = var.proton_domainkey
}

resource "vercel_dns_record" "proton_domainkey2" {
  team_id = var.vercel_team_id
  domain  = "planetfall.io"
  name    = "protonmail2._domainkey"
  type    = "CNAME"
  ttl     = 60
  value   = var.proton_domainkey2
}

resource "vercel_dns_record" "proton_domainkey3" {
  team_id = var.vercel_team_id
  domain  = "planetfall.io"
  name    = "protonmail3._domainkey"
  type    = "CNAME"
  ttl     = 60
  value   = var.proton_domainkey3
}

resource "vercel_dns_record" "proton_dmarc" {
  team_id = var.vercel_team_id
  domain  = "planetfall.io"
  name    = "_dmarc"
  type    = "TXT"
  ttl     = 60
  value   = var.proton_dmarc
}

resource "vercel_dns_record" "proton_mailsec" {
  team_id     = var.vercel_team_id
  domain      = "planetfall.io"
  name        = "" # Should be "@"
  type        = "MX"
  ttl         = 60
  mx_priority = 20
  value       = "mailsec.protonmail.ch"
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







resource "vercel_project" "nextjs_13_test" {
  name      = "planetfall-nextjs-13-test"
  team_id   = var.vercel_team_id
  framework = "nextjs"


  build_command              = "cd ../.. && pnpm turbo run build --filter=nextjs13-test"
  root_directory             = "apps/nextjs13-test"
  serverless_function_region = "fra1"

  git_repository = {
    repo = "chronark/planetfall"
    type = "github"
  }


}
