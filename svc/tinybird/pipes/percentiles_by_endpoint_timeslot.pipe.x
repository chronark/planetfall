NODE daily_latencypercentiles_by_endpoint
SQL >

    select endpointId, t, quantiles(0.5, 0.95, 0.99)(latency) as percentiles
    from checks
    group by endpointId, timeSlot(checks.time) as t


