
resource "vercel_dns_record" "clerk_accounts" {
  team_id = var.vercel_team_id
  domain  = vercel_project_domain.planetfall_io.domain
  name    = "accounts"
  type    = "CNAME"
  ttl     = 60
  value   = "accounts.clerk.services"
}


resource "vercel_dns_record" "clerk_clerk" {
  team_id = var.vercel_team_id
  domain  = vercel_project_domain.planetfall_io.domain
  name    = "clerk"
  type    = "CNAME"
  ttl     = 60
  value   = "frontend-api.clerk.services"
}


resource "vercel_dns_record" "clerk_domainkey" {
  team_id = var.vercel_team_id
  domain  = vercel_project_domain.planetfall_io.domain
  name    = "clk._domainkey"
  type    = "CNAME"
  ttl     = 60
  value   = "dkim1.n726fkhumtvm.clerk.services.dkim.amazonses.com"
}

resource "vercel_dns_record" "clerk_domainkey_2" {
  team_id = var.vercel_team_id
  domain  = vercel_project_domain.planetfall_io.domain
  name    = "clk2._domainkey"
  type    = "CNAME"
  ttl     = 60
  value   = "dkim2.n726fkhumtvm.clerk.services"
}
resource "vercel_dns_record" "clerk_clkmail" {
  team_id = var.vercel_team_id
  domain  = vercel_project_domain.planetfall_io.domain
  name    = "clkmail"
  type    = "CNAME"
  ttl     = 60
  value   = "mail.n726fkhumtvm.clerk.services"
}





