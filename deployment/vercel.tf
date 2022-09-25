resource "vercel_project" "pinger" {
  for_each                   = var.vercel_regions
  name                       = "planetfall-pinger-${each.value}"
  team_id = var.vercel_team_id
  serverless_function_region = each.value
  framework                  = "nextjs"


  build_command  = "cd ../.. && npx turbo run build --filter=pinger"
  root_directory = "svc/pinger"

  environment = [

    {
      key    = "AUTH_TOKEN"
      value  = var.auth_token
      target = ["production", "preview"]

    }
  ]
}

# resource "vercel_project_domain" "pinger" {
#   for_each   = vercel_project.pinger
#   project_id = each.value.id
#   domain     = "planetfall-pinger-${each.value.serverless_function_region}.vercel.app"
# }



data "vercel_project_directory" "root" {
  path = ".."
  
}

resource "vercel_deployment" "pinger" {
  for_each    = vercel_project.pinger
  project_id  = each.value.id
  files       = data.vercel_project_directory.root.files
  path_prefix = data.vercel_project_directory.root.path
  production  = true
  team_id = var.vercel_team_id
}




