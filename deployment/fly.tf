
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
  replicas = 2
}




resource "fly_app" "check_runner" {
  name = "planetfall-check-runner"
  org  = var.fly_org
}
variable "check_runner_image" {
  type = string

}

resource "fly_machine" "check_runner" {
  for_each = toset([for x in setproduct(local.fly_regions, range(1, local.replicas + 1)) : join("-", x)])
  app      = fly_app.check_runner.name
  region   = split("-", each.value)[0]
  name     = each.value
  image    = var.check_runner_image

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


