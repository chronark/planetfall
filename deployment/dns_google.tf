resource "vercel_dns_record" "google_domainkey" {
  team_id = var.vercel_team_id
  domain  = vercel_project_domain.planetfall_io.domain
  name    = "google._domainkey"
  type    = "TXT"
  ttl     = 60
  value   = "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAkIPNhMqHuAdmpFaiDvG3JY3fHqCP6Zko/9LrBGH9mJyLaZT2uJb+3NQkvuEwbpGwxjpXyzsyf+93M98lBN/If4mVpFaB4M3xEneKdTLwSf9uZW+2qqLS1RPpfIPuhqkE+4PwAeCKzvAlIbrTGk+3nZ/fxH+d7dwvMC6SRclZZ5NZ+tpFMtqbSSMCBnnom7t4OArb2eZu/c4CJs/4Xos+uOEr1sVfiI9NZIxJ7oEwjoh21myYzwyPFlzDkoJ1X+apwnTb+lIXKeSaJQtRricfegGrKj0FFQOfwQaEjNpmoD4vCqx7dKxcH+PH6qLxtYCyNzZKdXm7gka16FM16Y7REQIDAQAB"
}


resource "vercel_dns_record" "google_site_verification" {
  team_id = var.vercel_team_id
  domain  = vercel_project_domain.planetfall_io.domain
  name    = ""
  type    = "TXT"
  ttl     = 60
  value   = "google-site-verification=QGtUvO1z55KGUSrP0XrqspcRgEMfIVpKr5yPBmFtVcc"
}

resource "vercel_dns_record" "google_aspmx_alt_4" {
  team_id     = var.vercel_team_id
  domain      = vercel_project_domain.planetfall_io.domain
  name        = ""
  type        = "MX"
  ttl         = 3600
  mx_priority = 10
  value       = "alt4.aspmx.l.google.com"
}


resource "vercel_dns_record" "google_aspmx_alt_3" {
  team_id     = var.vercel_team_id
  domain      = vercel_project_domain.planetfall_io.domain
  name        = ""
  type        = "MX"
  ttl         = 3600
  mx_priority = 10
  value       = "alt3.aspmx.l.google.com"
}


resource "vercel_dns_record" "google_aspmx_alt_2" {
  team_id     = var.vercel_team_id
  domain      = vercel_project_domain.planetfall_io.domain
  name        = ""
  type        = "MX"
  ttl         = 3600
  mx_priority = 5
  value       = "alt2.aspmx.l.google.com"
}

resource "vercel_dns_record" "google_aspmx_alt_1" {
  team_id     = var.vercel_team_id
  domain      = vercel_project_domain.planetfall_io.domain
  name        = ""
  type        = "MX"
  ttl         = 3600
  mx_priority = 5
  value       = "alt1.aspmx.l.google.com"
}


resource "vercel_dns_record" "google_aspmx" {
  team_id     = var.vercel_team_id
  domain      = vercel_project_domain.planetfall_io.domain
  name        = ""
  type        = "MX"
  ttl         = 3600
  mx_priority = 1
  value       = "aspmx.l.google.com"
}
