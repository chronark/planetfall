
locals {
  vercel_regions = toset([
    "arn1",
    "bom1",
    "cdg1",
    "cle1",
    "cpt1",
    "dub1",
    "fra1",
    "gru1",
    "hkg1",
    "hnd1",
    "iad1",
    "icn1",
    "kix1",
    "lhr1",
    "pdx1",
    "sfo1",
    "sin1",
    "syd1",

  ])

}



resource "vercel_project" "pinger" {
  for_each = local.vercel_regions
  name     = "pinger-${each.value}"
  team_id  = var.vercel_team_id



  root_directory             = "svc/proxy"
  serverless_function_region = each.value

#   git_repository = {
#     repo = "chronark/planetfall"
#     type = "github"
#   }


#   environment = [
#     {
#       key    = "PINGER_AUTH_TOKEN"
#       value  = var.auth_token
#       target = ["production", "preview"]

#     }
#   ]

}

# resource "vercel_deployment" "pinger" {
#   for_each    = vercel_project.pinger
#   project_id  = each.value.id
#   team_id     = var.vercel_team_id
#   files       = data.vercel_project_directory.planetfall.files
#   path_prefix = data.vercel_project_directory.planetfall.path
#   production  = true


# }


resource "vercel_project_domain" "pinger" {
    for_each = vercel_project.pinger
  project_id = each.value.id
  team_id    = var.vercel_team_id
  domain     = "${each.value.serverless_function_region}-vercel-pinger.planetfall.io"
}