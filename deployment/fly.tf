
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

}




resource "fly_app" "check_runner" {
  name = "check-runner"
  org  = var.fly_org
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







resource "fly_cert" "check_runner" {
  app      = fly_app.check_runner.name
  hostname = "ping.planetfall.io"

}
