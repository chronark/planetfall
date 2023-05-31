resource "vercel_project" "api" {
  name      = "planetfall-api"
  team_id   = var.vercel_team_id
  framework = "nextjs"


  root_directory             = "apps/api"

  git_repository = {
    repo = "chronark/planetfall"
    type = "github"
  }

  environment = [
  
    {
      key   = "DATABASE_URL",
      value = var.database_url,
    target = ["production", "preview"] },


    {
      key    = "TINYBIRD_TOKEN"
      value  = var.tinybird_token
      target = ["production", "preview"]
    },
  ]

}








resource "vercel_project_domain" "api_planetfall_io" {
  project_id = vercel_project.api.id
  team_id    = var.vercel_team_id
  domain     = "api.planetfall.io"
}





