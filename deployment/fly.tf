
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
  replicas = 1

  check_runner_image = "chronark/planetfall-check-runner:${var.planetfall_version}"
  scheduler_image = "chronark/planetfall-scheduler:${var.planetfall_version}"
}




resource "fly_app" "check_runner" {
  name = "check-runner"
  org  = var.fly_org
}
resource "fly_machine" "check_runner" {
  for_each = toset([for x in setproduct(local.fly_regions, range(1, local.replicas + 1)) : join("-", x)])
  app      = fly_app.check_runner.name
  region   = split("-", each.value)[0]
  name     = each.value
  image    = local.check_runner_image

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


resource "fly_ip" "check_runner_v4" {
  app  = fly_app.check_runner.name
  type = "v4"


}
resource "fly_ip" "check_runner_v6" {
  app  = fly_app.check_runner.name
  type = "v6"


}



resource "fly_app" "scheduler" {
  name = "planetfall-scheduler"
  org  = var.fly_org
}


resource "fly_machine" "scheduler" {
  app    = fly_app.scheduler.name
  name   = "scheduler"
  region = "ams"
  image  = local.scheduler_image

  cpus     = 1
  cputype  = "shared"
  memorymb = 1024

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

  env = {
    # KAFKA_BROKER     = "${upstash_kafka_cluster.planetfall.tcp_endpoint}:9092"
    # KAFKA_USERNAME   = upstash_kafka_cluster.planetfall.username
    # KAFKA_PASSWORD   = upstash_kafka_cluster.planetfall.password
    AXIOM_TOKEN      = var.axiom_token
    TINYBIRD_TOKEN   = var.tinybird_token
    DATABASE_URL     = var.database_url
    SENDGRID_API_KEY = var.sendgrid_api_key

  }


}





resource "fly_cert" "check_runner" {
  app      = fly_app.check_runner.name
  hostname = "ping.planetfall.io"

}
