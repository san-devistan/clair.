# Frequently Raised Errors

## Authorization

### Email already in use

When calling the auth URL you are redirected to your callback with the following query parameters:

txt

Copy

```
error=Invalid+request&
reason=Email+already+in+use
```

*   Please make sure to sign up a new trial account for the desired country using the links in the table above. **You cannot use your Sage Developer Account for signing into Sage Accounting, as it is not linked to any business.**
*   If you cannot see the country selection page during the authorization process, please visit [https://sageone.com/?clear](https://sageone.com/?clear) to clear all cookies before the authorization with Sage Accounting.
*   Ensure that the business you are signing in with belongs to the same country you select on the country page. Otherwise, you will get this error returned as well.

## Token Refresh, Token Exchange

### Status Code 400 - Invalid Grant

Getting a 400 HTTP error response during token exchange (`POST https://oauth.accounting.sage.com/token`) with

json

Copy

```
{
  "error": "invalid_grant"
}
```

This is often caused by the token or code used being invalid or having expired. It will expire after 60 seconds and is for a single use.

It could also be caused by the grant type, which must be set to `authorization_code` or `refresh_token` depending on what you are using.

One other potential cause is that the `redirect_uri` used in the request does not match the one registered exactly. It must match character for character.

## API Calls

### Status Code 401 - Authorization Failure: No active subscription. (MSE)

json

Copy

```
[
  {
    "$severity": "error",
    "$dataCode": "AuthorizationFailure",
    "$message": "No active subscription. (MSE)",
    "$source": ""
  }
]
```

This means the trial period of the business has expired or the business has canceled their subscription to Accounting. When this happens with the business you are developing with, we kindly recommend signing up a new business with a fresh trial period.

### Status Code 403 - Forbidden

json

Copy

```
[
  {
    "$severity": "error",
    "$dataCode": "MultiUserAccessDenied",
    "$message": "The current user is not allowed to access that resource with that method.",
    "$source": ""
  }
]
```

In v3.1 access rights are implemented allowing any user to authenticate and make requests of the modules of Accounting they have been given permission to use. A 403 message can be thrown if the user does not have the required permission to make a request (e.g. Read only access to contacts would result in an error if a `POST` request was sent). To manage the access rights for users you can access the Settings option and then Manage Users in the Sage Accounting application.

### Status Code 404 - Not Found

If you encounter this error, it is normally caused by making a request using an invalid or incorrect endpoint.

For example: A client has used an invalid `id` of the requested resource or even called an unknown resource (`customers` instead of `contacts`).

### Status Code 500 - Unexpected Error

Oh no, it happened again.

json

Copy

```
[
  {
    "$severity": "error",
    "$dataCode": "UnexpectedError",
    "$message": "An unexpected error occurred.",
    "$source": ""
  }
]
```

While the green path within the API is thoroughly tested, some edge cases may result in such 500 error responses. This may be unsatisfying, but the only short term solution we can offer is to play around with input parameters and see if you can get the request back on the green path.

The longer term solution is to inform us and help us to deliver a fix more quickly by providing additional information, like the request Id, the request body or other circumstance that help us to reproduce the error. We do monitor 500 responses and constantly try to reduce them, but in many occasions this additional information really helps us.

[Previous: FAQ - Frequently Asked Questions](https://developer.sage.com/accounting/docs/v1.0.0/guides/learning/key-concepts/faq)

[Next: Idempotency](https://developer.sage.com/accounting/docs/v1.0.0/guides/learning/key-concepts/idempotency)

Was this page helpful?

Yes![Image 18: Yes](https://developer.sage.com/_nextimages/icons/detailed/like.svg)No![Image 19: No](https://developer.sage.com/_nextimages/icons/detailed/dislike.svg)

[[](https://www.sage.com/)](https://www.sage.com/)

[](https://twitter.com/SageUK)[](https://github.com/Sage)[](https://www.facebook.com/SageUK)[](https://www.instagram.com/sageofficial/)[](https://www.linkedin.com/company/sage-software)[](https://www.youtube.com/user/SageUKOfficial)

[Legal](https://www.sage.com/en-gb/legal/)[Privacy Notice](https://www.sage.com/en-gb/legal/privacy/)[Cookies](https://developer.sage.com/cookies)[Developer Service License Agreement](https://developer.sage.com/files/DeveloperServicesLicenseAgreement.pdf)[Trust and Security Hub](https://www.sage.com/en-gb/trust-security/)[Marketplace Security](https://developer.sage.com/guidelines/docs/latest/guides/security/marketplace)

2018-2026 © Sage Group Plc or its licensors. All rights reserved.Commit: e4c2bd81c3

[Sage Accounting](https://developer.sage.com/accounting)

[Overview](https://developer.sage.com/accounting)

[API](https://developer.sage.com/accounting/apis/sagebusinesscloudaccounting/3.1.0/accounting)

[Keys](https://developerselfservice.sageone.com/session/new)

[Docs](https://developer.sage.com/accounting/docs/v1.0.0/guides/quick-start)

[Support](https://developer.sage.com/accounting/docs/v1.0.0/guides/support)

[Announcements](https://developer.sage.com/accounting/announcements)

Sage Accounting

## Privacy Preference Center

*   ### Your Privacy 
*   ### Strictly Necessary Cookies 
*   ### Performance Cookies 

#### Your Privacy

We use strictly necessary cookies to make our website work. We’d also like to set other cookies to help us improve it. By clicking ‘Accept Cookies’, you agree to the storing of all optional cookies on your device which we will access and use to enhance site navigation, analyse site usage and performance, improve the functionality of our website, track your activities, offer real-time help if appropriate and assist in our marketing efforts. Click ‘Cookie Details’ for details about the optional cookies in each section or 'Cookie Settings' at the bottom of each page to view and change your preferences. For more detailed information about the cookies we use, see our cookies policy.

[Cookie Policy](https://www.sage.com/en-us/legal/privacy-and-cookies/)

#### Strictly Necessary Cookies

Always Active

These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in or filling in forms. You can set your browser to block or alert you about these cookies, but some parts of the site will not then work. These cookies do not store any personally identifiable information.

Cookies Details‎

#### Performance Cookies

- [x] Performance Cookies 

These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site. All information these cookies collect is aggregated and therefore anonymous. If you do not allow these cookies we will not know when you have visited our site, and will not be able to monitor its performance.

Cookies Details‎

### Back

Consent Leg.Interest

- [x] checkbox label label

- [x] checkbox label label

- [x] checkbox label label

*     View Third Party Cookies 

    *   Name cookie name  

Clear

- [x] checkbox label label

Apply Cancel

Confirm My Choices

Allow All

[](https://www.onetrust.com/products/cookie-consent/)

Our cookies are meant to enhance your own experience while also helping power our website. We also use cookies so that we can better understand how our website is used. We then use this data to provide more tailored online content. 

 When you consent to cookies, collected data may be used to profile you. This means that information collected using cookies may be linked back to other data Sage holds about you (whether you are a Sage Customer or have otherwise provided personal data to Sage). For more information, please see our [Cookie and Privacy Policy](https://www.sage.com/en-us/legal/privacy-and-cookies/).

Please click "Accept all cookies" to continue to enjoy our website with all cookies or click "Cookie settings" to manage your cookie preferences

Accept All Cookies

Cookies Settings
