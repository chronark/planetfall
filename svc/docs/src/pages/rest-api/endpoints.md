---
title: Endpoints
description: Quidem magni aut exercitationem maxime rerum eos.
---

Create, update, and delete endpoints and query their associated checks.

---


## **GET** /v1/endpoints/{endpointId}/checks

Returns a list of checks for the given endpoint.

### Path Parameters

| Parameter      | Type   | Required | Description                                                                             |
| -------------- | ------ | -------- | --------------------------------------------------------------------------------------- |
| **endpointId** | String | yes      | The ID of the endpoint. You can find this in the URL when viewing the endpoint details. |

### Query Paramters

You can filter the results by passing query parameters. 


| Paramter | Type   | Required | Description                                                         |
|----------|--------|----------|---------------------------------------------------------------------|
| **since**    | Integer    | No       | Only return checks after this time [unix timestamp in milliseconds] |
| **region**   | String | No       | Filter checks by region                                             |
| **limit**    | Integer    | No       | Limit response to this many checks, by default up to 1000 checks are returned.                                  |

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
