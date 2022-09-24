terraform {
  backend "remote" {
    organization = "chronark"

    workspaces {
      name = "planetfall"
    }
  }
}
