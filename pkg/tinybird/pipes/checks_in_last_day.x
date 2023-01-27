VERSION 1
TOKEN "checks_in_last_hour_endpoint_read_6166" READ

NODE checks_in_last_day0
SQL >

    SELECT COUNT(*) as checks FROM checks WHERE time > now() - interval 1 day


