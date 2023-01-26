
locals {
  fly_regions = toset([
    "ams",
    "cdg",
    "den",
    "dfw",
    "ewr",
    "fra",
    "gru",
    "hkg",
    "iad",
    "jnb",
    "lax",
    "lhr",
    "maa",
    "mad",
    "mia",
    "nrt",
    "ord",
    "otp",
    "scl",
    "sea",
    "sin",
    "sjc",
    "syd",
    "waw",
    "yul",
    "yyz"
  ])
  replicas = 3
}




resource "fly_app" "pinger" {
  name = "pinger"
  org  = var.fly_org
}
variable "pinger_image" {
  type = string

}

resource "fly_machine" "pinger" {
  for_each = toset([for x in setproduct(local.fly_regions, range(1, local.replicas + 1)) : join("-", x)])
  app      = fly_app.pinger.name
  region   = split("-", each.value)[0]
  name     = each.value
  image    = var.pinger_image

  cpus     = 1
  cputype  = "shared"
  memorymb = 1024
  env = {
    AXIOM_TOKEN = var.axiom_token
    AXIOM_ORG   = var.axiom_org
  }
  services = [
    {
      ports = [
        {
          port     = 443
          handlers = ["tls", "http"]
        },
        {
          port     = 80
          handlers = ["http"]
        }
      ]
      "protocol" : "tcp",
      "internal_port" : 8080
    }
  ]


}


resource "fly_ip" "pinger_v4" {
  app  = fly_app.pinger.name
  type = "v4"


}
resource "fly_ip" "pinger_v6" {
  app  = fly_app.pinger.name
  type = "v6"


}



resource "fly_app" "scheduler" {
  name = "planetfall-scheduler"
  org  = var.fly_org
}

variable "scheduler_image" {
  type = string

}
# resource "fly_machine" "scheduler" {
#   app    = fly_app.scheduler.name
#   name   = "scheduler"
#   region = "ams"
#   image  = var.scheduler_image

#   cpus     = 1
#   cputype  = "shared"
#   memorymb = 1024

#   services = [
#     {
#       ports = [
#         {
#           port     = 443
#           handlers = ["tls", "http"]
#         },
#         {
#           port     = 80
#           handlers = ["http"]
#         }
#       ]
#       "protocol" : "tcp",
#       "internal_port" : 8080
#     }
#   ]

#   env = {

#     UPSTASH_REDIS_REST_URL   = "https://${upstash_redis_database.planetfall.endpoint}"
#     UPSTASH_REDIS_REST_TOKEN = upstash_redis_database.planetfall.rest_token
#     KAFKA_BROKER             = "${upstash_kafka_cluster.planetfall.tcp_endpoint}:9092"
#     KAFKA_USERNAME           = upstash_kafka_cluster.planetfall.username
#     KAFKA_PASSWORD           = upstash_kafka_cluster.planetfall.password
#     AXIOM_TOKEN              = var.axiom_token
#     TINYBIRD_TOKEN           = var.tinybird_token
#     DATABASE_URL             = var.database_url
#     SENDGRID_API_KEY         = var.sendgrid_api_key
#     STRIPE_SECRET_KEY        = var.stripe_secret_key

#   }


# }



resource "fly_ip" "scheduler_v4" {
  app  = fly_app.scheduler.name
  type = "v4"


}
resource "fly_ip" "scheduler_v6" {
  app  = fly_app.scheduler.name
  type = "v6"


}



resource "fly_cert" "ping" {
  app      = fly_app.pinger.name
  hostname = "ping.planetfall.io"
}
