
resource "vercel_dns_record" "mintlify_txt" {
  team_id = var.vercel_team_id
  domain  = vercel_project_domain.planetfall_io.domain
  name    = "_vercel"
  type    = "TXT"
  ttl     = 60
  value   = "vc-domain-verify=docs.planetfall.io,5f4d52d9eacaa379b83d"
}


resource "vercel_dns_record" "mintlify_cname" {
  team_id = var.vercel_team_id
  domain  = vercel_project_domain.planetfall_io.domain
  name    = "docs"
  type    = "CNAME"
  ttl     = 60
  value   = "cname.vercel-dns.com."
}

