---
title: Checks
description: Quidem magni aut exercitationem maxime rerum eos.
---

The **endpoints** API allows you to create, update, and delete endpoints as well as querying checks.

---


## **GET** /v1/endpoints/{endpointId}/checks

Returns a list of checks for the given endpoint.

### Path Parameters

| Parameter      | Type   | Required | Description                                                                             |
| -------------- | ------ | -------- | --------------------------------------------------------------------------------------- |
| **endpointId** | string | yes      | The ID of the endpoint. You can find this in the URL when viewing the endpoint details. |

### Query Paramters

You can filter the results by passing query parameters. 


| Paramter | Type   | Required | Description                                                         |
|----------|--------|----------|---------------------------------------------------------------------|
| **since**    | int    | No       | Only return checks after this time [unix timestamp in milliseconds] |
| **region**   | string | No       | Filter checks by region                                             |
| **limit**    | int    | No       | Limit response to this many checks                                  |

### Response

```json
{
    data: [
        {
            id:           string,
            endpointId:   string,
            latency?:     number,
            time:         number,
            error?:       string,
            status?:      number,
            body?:        string,
            headers?:     Record<string, string>,
            regionId:     string,
        },
        {
            ...
        }
    ]
  }
```
