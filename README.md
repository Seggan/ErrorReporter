# ErrorReporter

A script running in Clouflare Workers that makes automatic error reports.

## Request
The request **must** be a `POST` request
### Headers
`User`: The GitHub username of the repository to make the issue to

`Repo`: The GitHub repository to make the issue to

`Version`: Currently not required, but will be used in the future when there is actually more 
than one version

`Content-Type`: must be `application/json`
### Body
The body of the request is a JSON object containing the issue. The keys are headers, and the values are the
content. For example, the object 
```json
{
    "Test": "Another test"
}
```

will be transformed into 
```md
# Test
Another test
```

There is one key that **must** be included, and that is `Hashcode`. That key is used to identify
duplicate issues. Reporting an error that has the same hashcode as an existing (open) issue will be ingored
and simply return `200 OK`. The hashcode itself can be anything, but must uniquely identify the error. For
example, the [Java API](https://githuub.com/Seggan/ErrorReporter-Java) uses a combination of the Java hashcode
(hence the name "hashcode") of the error and the application version.
### Codes
`404`: The User/Repository was not found

`410`: The repository has issues disabled

`503`: The GitHub service is down

`400`: Bad Request; either the request was not a `POST` request, or the `Hashcode` key was not included

`201`: The error was reported and an issue was created. The response body has the JSON of the issue

`200`: The error is already reported, i.e. a duplicate