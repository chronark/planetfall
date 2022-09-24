resource "vercel_project" "pinger" {
  for_each                   = var.vercel_regions
  name                       = "planetfall-pinger-${each.value}"
  framework                  = "nextjs"
  serverless_function_region = each.value



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



data "vercel_project_directory" "pinger-directory" {
  path = "../svc/pinger"
}

resource "vercel_deployment" "pinger" {
  for_each    = vercel_project.pinger
  project_id  = each.value.id
  files       = data.vercel_project_directory.nextjs.files
  path_prefix = data.vercel_project_directory.nextjs.path
  production  = true
}




