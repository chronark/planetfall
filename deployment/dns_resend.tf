
resource "vercel_dns_record" "resend_spf_mx" {
  team_id     = var.vercel_team_id
  domain      = vercel_project_domain.planetfall_io.domain
  name        = "bounces"
  type        = "MX"
  ttl         = 60
  mx_priority = 10
  value       = "feedback-smtp.us-east-1.amazonses.com"
}


resource "vercel_dns_record" "resend_spf_txt" {
  team_id = var.vercel_team_id
  domain  = vercel_project_domain.planetfall_io.domain
  name    = "bounces"
  type    = "TXT"
  ttl     = 60
  value   = "v=spf1 include:amazonses.com ~all"
}


resource "vercel_dns_record" "resend_dkim_iorec6tevdstuzig7tc2dfv622slyyuu" {
  team_id = var.vercel_team_id
  domain  = vercel_project_domain.planetfall_io.domain
  name    = "iorec6tevdstuzig7tc2dfv622slyyuu._domainkey"
  type    = "CNAME"
  ttl     = 60
  value   = "iorec6tevdstuzig7tc2dfv622slyyuu.dkim.amazonses.com"
}

resource "vercel_dns_record" "resend_dkim_m4qxxdawi5spoqhbboa3xwa7eobpua3m" {
  team_id = var.vercel_team_id
  domain  = vercel_project_domain.planetfall_io.domain
  name    = "m4qxxdawi5spoqhbboa3xwa7eobpua3m._domainkey"
  type    = "CNAME"
  ttl     = 60
  value   = "m4qxxdawi5spoqhbboa3xwa7eobpua3m.dkim.amazonses.com"
}
resource "vercel_dns_record" "resend_dkim_wutpcga6f4p5krwq77swg5q6gg6qcuqo" {
  team_id = var.vercel_team_id
  domain  = vercel_project_domain.planetfall_io.domain
  name    = "wutpcga6f4p5krwq77swg5q6gg6qcuqo._domainkey"
  type    = "CNAME"
  ttl     = 60
  value   = "wutpcga6f4p5krwq77swg5q6gg6qcuqo.dkim.amazonses.com"
}





