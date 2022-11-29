
locals {
  fly_regions = toset([
     "fra",
     "ams"

  ])

}

resource "fly_app" "pinger" {
  # for_each = local.fly_regions
  name     = "planetfall-pinger"#{each.value}"
  org      = var.fly_org
}


resource "fly_machine" "pinger" {
  for_each = local.fly_regions
  app      = "planetfall-pinger"#-${each.value}"
  region   = each.value
  image    = "chronark/planetfall-pinger:latest"
  cputype  = "shared"
  cpus     = 1
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
      "internal_port" : 80
    }
  ]
  depends_on = [
    fly_app.pinger
  ]

}


resource "fly_ip" "pinger"{
  app = "planetfall-pinger"
  type = "v4"
}