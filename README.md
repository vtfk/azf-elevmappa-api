# azf-elevmappa-api

API for returning all your students. Used in [elevmappa](https://github.com/vtfk/elevmappa-web-react)

Supports mulitple P360 instances

## API

All calls requires a valid bearer token from Azure

### ```GET /students```

Returns an array of students

```JavaScript
[
  {
    "firstName": "Helga",
    "middleName": null,
    "lastName": "Durk",
    "fullName": "Helga Durk",
    "personalIdNumber": "02059711111",
    "mobilePhone": "+4798888888",
    "mail": "helgad@hotmail.com",
    "userName": "0205helgdurk",
    "contactTeacher": false,
    "unitId": "BAMVS",
    "unitName": "Bamble vgs. avd. Grasmyr",
    "organizationNumber": "NO974568098",
    "mainGroupName": "BAMVS:3ST",
    "level": "VG3",
    "groups": [
      {
        "id": "BAMVS:3ST/151FSP5098",
        "description": "Spansk I+II",
        "unitId": "BAMVS",
        "unitName": "Bamble vgs. avd. Grasmyr",
        "organizationNumber": "NO974568098"
      }
    ]
  },
  {
    "firstName": "Halgrim",
    "middleName": "",
    "lastName": "Durk",
    "fullName": "Halgrim Durk",
    "personalIdNumber": "02109911111",
    "mobilePhone": "+4741111111",
    "mail": "halgrimdurk@gmail.com",
    "userName": "0101durk",
    "contactTeacher": true,
    "unitId": "BAMVS",
    "unitName": "Bamble vgs. avd. Grasmyr",
    "organizationNumber": "NO974568098",
    "mainGroupName": "BAMVS:1ST",
    "level": "VG1",
    "groups": [
      {
        "id": "BAMVS:1ST/151FSP5091",
        "description": "Spansk I, 1. år",
        "unitId": "BAMVS",
        "unitName": "Bamble vgs. avd. Grasmyr",
        "organizationNumber": "NO974568098"
      }
    ]
  }
]
```

### ```GET /students/:id```

Returns an object of given student with available documents

```JavaScript
{
  "firstName": "Helge Grim",
  "middleName": null,
  "lastName": "Grim",
  "fullName": "Helge Grim",
  "personalIdNumber": "02059711111",
  "mobilePhone": "+4798888888",
  "mail": "helgeg@hotmail.com",
  "userName": "0205helgeg",
  "contactTeacher": false,
  "unitId": "BAMVS",
  "unitName": "Bamble vgs. avd. Grasmyr",
  "organizationNumber": "NO974568098",
  "mainGroupName": "BAMVS:3ST",
  "level": "VG3",
  "groups": [
    {
      "id": "BAMVS:3ST/151FSP5098",
      "description": "Spansk I+II",
      "unitId": "BAMVS",
      "unitName": "Bamble vgs. avd. Grasmyr",
      "organizationNumber": "NO974568098",
    }
  ],
  "documents": [
    {
      "source": "TFK",
      "id": "16/03875-1",
      "date": "2020-03-17T02:12:01",
      "displayDate": "17.03.2020",
      "docId": "20/00345-1",
      "title": "Lullabies from the edge",
      "files": [
        {
          "from": "PPT",
          "to": "Bamble Videregående skole",
          "date": "2020-03-17",
          "category": "",
          "title": "Sakkyndig vurdering.pdf",
          "file": "1234",
          "recno": 1234
        }
      ]
    },
    {
      "source": "TFK",
      "id": "16/03875-2",
      "date": "2020-03-17T02:12:01",
      "displayDate": "17.03.2020",
      "docId": "20/00345-1",
      "title": "Salige reker",
      "files": [
        {
          "from": "PPT",
          "to": "Bamble Videregående skole",
          "date": "2020-03-17",
          "category": "",
          "title": "Sakkyndig vurdering.pdf",
          "file": "1234",
          "recno": 1234
        }
      ]
    },
    {
      "source": "VTFK Sikker",
      "id": "20/00345-1",
      "date": "2020-03-17T02:12:01",
      "displayDate": "17.03.2020",
      "docId": "20/00345-1",
      "title": "It came from Søre Ål",
      "files": [
        {
          "from": "PPT",
          "to": "Bamble Videregående skole",
          "date": "2020-03-17",
          "category": "",
          "title": "Sakkyndig vurdering.pdf",
          "file": "1234",
          "recno": 1234
        }
      ]
    }
  ]
}
```

### ```POST /file```

**body**
```json
{
  "source": "VTFK Sikker",
  "fileId": "20/00345-1",
  "recno": 1234,
  "studentId": "0205helgeg"
}
```

Returns an object with requested file as Base64

```JavaScript
{
  "file": "JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSIAogICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCgo1IDAgb2JqICAlIHBhZ2UgY29udGVudAo8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNzkgMDAwMDAgbiAKMDAwMDAwMDE3MyAwMDAwMCBuIAowMDAwMDAwMzAxIDAwMDAwIG4gCjAwMDAwMDAzODAgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDkyCiUlRU9G"
}
```

## Configuration

You'll need an azure tenant and a **JWT secret** and **Endpoint url** for your PIFU service.

### Environment variables

Put these in your `local.settings.json` file:

```json
"AUTH_ISS": "https://login.microsoftonline.com/%azure-tenant-guid%/v2.0", // this should be set as empty in local development
"AUTH_AUD": "%guid%", // App registration Client ID
"ACCESS_GROUP_PREFIX": "OF-",
"ACCESS_GROUP_POSTFIX": "TILGANGELEVMAPPA",
"DEMO": false,
"DEMO_ACCESS_GROUPS": "OF-BAV-TILGANGELEVMAPPA,OF-BOV-TILGANGELEVMAPPA",
"DEMO_USER": "noen.andre@vtfk.no",
"MONGODB_CONNECTION": "mongodb+srv://username:password@host.mongodb.net?retryWrites=true&w=majority",
"MONGODB_COLLECTION": "elevmappa",
"MONGODB_NAME": "elevmappa",
"PIFU_URL": "https://api.com/pifu/v3",
"PIFU_JWT_SECRET": "something really really secret",
```

> If you want to enable `Papertrail` logging, add these environment variables:<br>
**PAPERTRAIL_HOST**: *host url*<br>
**PAPERTRAIL_TOKEN**: *token*<br><br>
If you want to disable logging for a breif moment, set `PAPERTRAIL_DISABLE_LOGGING` to **true**

## DEMO

:warning: `DEMO mode will bypass authorization check and ALL calls will be performed as DEMO_USER. DO NOT USE IN PRODUCTION`

When debugging locally there can be conveniant to experience exactly what a end-user sees.

Set `DEMO` to **true** and `DEMO_USER` to **end-users email address** in `local.settings.json`

If you want to debug end-user as a **rådgiver**, set `DEMO_ACCESS_GROUPS` to a comma separated list. See example above in *Environment variables*

### P360 source(s)

This API supports multiple **P360** sources in *RPC*

You add a source as a series of well named environment variables in `local.settings.json` for development and as `Application settings` in **Azure function** for production.

**The syntax for a source is**:

- The first part, **P360**, is required as a starting point for all sources
- The next part, **VTFKINT**, is the internal name of the source in this API. This name will be used internally to gather and construct the source object
- The last part, for instance **NAME**, is the property name which will be added to the source object
- The value, **VTFK Intern**, is the value which will be set to the **NAME** property on the source object
- `All parts MUST be separated by a '_' (underscore)`
- `Only the first 3 parts will be read and used!`

**Add as many as you need of these, just remember to make the naming unique**
```json
"P360_VTFKINT_NAME": "VTFK Intern",
"P360_VTFKINT_ENABLED": true,
"P360_VTFKINT_TOKEN": "token",
"P360_VTFKINT_BASEURL": "http://360server.com:3001",
"P360_VTFKINT_STATUSES": "Under behandling,Avsluttet", // 'Under behandling' is used for archives in production. 'Avsluttet' is used for historical archives. If this one is left out, 'Under behandling' will be used! Can contain multiple values separated by ',' (comma)
"P360_VTFKINT_STATUSCODES": "J,E,F", // 'J' is for Journalført. 'E' is for Ekspedert. 'F' is for Ferdig. If this one is left out, 'J,E,F' will be used! Can contain multiple values separated by ',' (comma)
"P360_VTFKINT_EXCLUDEDENTERPRISES": "506,507" // Recno's of ResponsibleEnterprise's to exclude. If this one is left out, no excludes will be made! Can contain multiple values separated by ',' (comma)
```

This will be constructed to a source object like this:
```json
{
  "internal": "VTFKINT",
  "name": "VTFK Intern",
  "enabled": true,
  "token": "token",
  "baseUrl": "http://360server.com:3001",
  "statuses": ["Under behandling", "Avsluttet"],
  "statusCodes": ["J", "E", "F"],
  "excludedEnterprises": [506, 507]
}
```

## Related

- [azf-pifu-api](https://github.com/vtfk/azf-pifu-api) - PIFU service for MinElev, MinElev-leder and Elevmappa
- [@vtfk/p360](https://github.com/vtfk/p360) - Node wrapper for Public 360 SIF RPC Service from [Tieto](https://www.tieto.no/)
