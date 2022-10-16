---
title: Planetfall API
description: The Planetfall REST API gives you access to all data and functionality of planetfall.
---

## API Basics

## Content-Type

All requests and responses are in JSON format. The `Content-Type` header must be
set to `application/json` for all requests and responses.

## Authentication

All requests must be authenticated with a valid access token. 
TODO: Build API key page

```
Authorization: Bearer <TOKEN>
```


## Errors

All errors are returned as JSON objects with the following structure:
The `code` field is a unique identifier for the error. The `message` field is a human readable hint at what went wrong.

```json
{
  "error": {
    "code": 400,
    "message": "field xyz is required"
  }
}
```
Some endpoints might return additional fields in the error object. This will be documented in the endpoint description.


## Versioning

The Planetfall API is versioned. All endpoints are prefixed with the version number. The versioning is not global and different endpoints might have different versions.

```
https://api.planetfall.io/v1/...
```