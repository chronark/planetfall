
locals {
  fly_regions = toset([
    "ams-1",
    "ams-2",
    "ams-3",
    "ams-4",
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

}

resource "fly_app" "pinger" {
  # for_each = local.fly_regions
  name = "planetfall-pinger"
  org  = var.fly_org
}



variable "pinger_image" {
  type = string

}

resource "fly_machine" "pinger" {
  for_each = local.fly_regions
  app      = fly_app.pinger.name
  region   = split("-", each.value)[0]
  image    = var.pinger_image
  name     = each.value

  cpus     = 1
  cputype  = "performance"
  memorymb = 2048
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


resource "fly_ip" "v4" {
  app  = fly_app.pinger.name
  type = "v4"


}
resource "fly_ip" "v6" {
  app  = fly_app.pinger.name
  type = "v6"


}
