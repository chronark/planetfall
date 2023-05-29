
resource "vercel_dns_record" "api" {
  team_id = var.vercel_team_id
  domain  = vercel_project_domain.planetfall_io.domain
  name    = "api"
  type    = "CNAME"
  ttl     = 60
  value   = "api.planetfall.work"
}
