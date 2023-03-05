
resource "vercel_dns_record" "plain_bounces" {
  team_id = var.vercel_team_id
  domain  = vercel_project_domain.planetfall_io.domain
  name    = "plain-bounces"
  type    = "CNAME"
  ttl     = 60
  value   = "pm.mtasv.net"
}


resource "vercel_dns_record" "plain_domainkey" {
  team_id = var.vercel_team_id
  domain  = vercel_project_domain.planetfall_io.domain
  name    = "20230303002100pm._domainkey"
  type    = "TXT"
  ttl     = 60
  value   = "k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCwP5XTe1SFsZ3XUjOplVabfZJdL+bL4rouuL993lvG6/pYXTucISGNu0HNn6SE8AEjpj5m36rG513MCjwtmgOW8ini75Su55N9srGToIplnl0SIwXaXfWZ2aUzfzvC1hOS2RZobuqQernCfD71KNezrg0DP3B23tliNmeYmsgEzQIDAQAB"
}

