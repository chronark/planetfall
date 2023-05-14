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
      key    = "UPSTASH_REDIS_REST_URL"
      value  = "https:${upstash_redis_database.planetfall.endpoint}"
      target = ["production", "preview", "development"]
      }, {
      key    = "UPSTASH_REDIS_REST_TOKEN"
      value  = upstash_redis_database.planetfall.rest_token
      target = ["production", "preview", "development"]
    },

    {
      key    = "RESEND_API_KEY"
      value  = var.resend_api_key,
      target = ["production", "preview", "development"]

    },
    {
      key    = "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
      value  = var.clerk_publishable_key.production,
      target = ["production"]
    },
    {
      key    = "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
      value  = var.clerk_publishable_key.preview,
      target = ["preview"]
    },
    {
      key    = "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
      value  = var.clerk_publishable_key.development,
      target = ["development"]
    },
    {
      key    = "CLERK_SECRET_KEY",
      value  = var.clerk_secret_key.production,
      target = ["production"]
    },
    {
      key    = "CLERK_SECRET_KEY",
      value  = var.clerk_secret_key.preview,
      target = ["preview"]
    },
    {
      key    = "CLERK_SECRET_KEY",
      value  = var.clerk_secret_key.development,
      target = ["development"]
    },
    {
      key    = "CLERK_WEBHOOK_SECRET",
      value  = var.clerk_webhook_secret.production,
      target = ["production"]
    },
    {
      key    = "CLERK_WEBHOOK_SECRET",
      value  = var.clerk_webhook_secret.preview,
      target = ["preview"]
    },
    {
      key    = "CLERK_WEBHOOK_SECRET",
      value  = var.clerk_webhook_secret.development,
      target = ["development"]
    },
    {
      key    = "NEXT_PUBLIC_PLAIN_APP_KEY",
      value  = var.plain_app_key,
      target = ["production", "preview", "development"]
    },
    {
      key    = "HIGHSTORM_TOKEN",
      value  = var.highstorm_token,
      target = ["production"]
    }

  ]

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


resource "vercel_project" "docs" {
  name      = "planetfall-docs"
  team_id   = var.vercel_team_id
  framework = "nextjs"


  build_command              = "cd ../.. && pnpm turbo run build --filter=docs"
  root_directory             = "apps/docs"
  serverless_function_region = "fra1"

  git_repository = {
    repo = "chronark/planetfall"
    type = "github"
  }


}



resource "vercel_project_domain" "planetfall_docs" {
  project_id = vercel_project.docs.id
  team_id    = var.vercel_team_id
  domain     = "planetfall-docs.vercel.app"
}



resource "vercel_project" "vercel_edge_runner" {
  name      = "vercel-edge-runner"
  team_id   = var.vercel_team_id
  framework = "nextjs"


  build_command              = "cd ../.. && pnpm turbo run build --filter=vercel-edge-runner"
  root_directory             = "apps/vercel-edge-runner"
  serverless_function_region = "fra1"

  git_repository = {
    repo = "chronark/planetfall"
    type = "github"
  }
  environment = [
    {
      key    = "SIGNING_PUBLIC_KEY",
      value  = var.check_runner_signing_keys.public,
      target = ["production", "preview", "development"]
    }
  ]


}





resource "vercel_project_domain" "planetfall_edge_runner" {
  project_id = vercel_project.vercel_edge_runner.id
  team_id    = var.vercel_team_id
  domain     = "planetfall-edge-runner.vercel.app"
}
