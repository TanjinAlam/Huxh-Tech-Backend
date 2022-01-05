/**
 * The request has succeeded.
 *
 * @type {number}
 * @desc 200 OK
 */
 module.exports.STATUS_OK = 200


 /**
  * The request has succeeded and a new resource has been created as a result.
  *
  * @type {number}
  * @desc 201 Created
  */
 module.exports.STATUS_CREATED = 201
 
 
 /**
  * The request has been received but not yet acted upon.
  *
  * @type {number}
  * @desc 202 Accepted
  */
 module.exports.STATUS_ACCPETED = 202
 
 
 /**
  * This response code means the returned meta-information is not exactly the same as is available from the origin server
  *
  * @type {number}
  * @desc 203 Non-Authoritative Information
  */
 module.exports.STATUS_NON_AUTHORITATIVE_INFORMATION = 203
 
 /**
  * There is no content to send for this request, but the headers may be useful.
  *
  * @type {number}
  * @desc 204 No Content
  */
  module.exports.STATUS_NO_CONTENT = 204
 
 
 /**
  * The server could not understand the request due to invalid syntax.
  *
  * @type {number}
  * @desc 400 Bad Request
  */
 module.exports.STATUS_BAD_REQUEST = 400
 
 
 /**
  * the client must authenticate itself to get the requested response.
  *
  * @type {number}
  * @desc 401 Unauthorized
  */
 module.exports.STATUS_UNAUTHORIZED = 401
 
 
 /**
  * The client does not have access rights to the content
  *
  * @type {number}
  * @desc 403 Forbidden
  */
 module.exports.STATUS_FORBIDDEN = 403
 
 
 /**
  * The server can not find the requested resource.
  *
  * @type {number}
  * @desc 404 Not Found
  */
 module.exports.STATUS_NOT_FOUND = 404
 
 
 /**
  * This response code means the returned meta-information is not exactly the same as is available from the origin server
  *
  * @type {number}
  * @desc 409 Non-Authoritative Information
  */
  module.exports.CONFLECT_ERROR = 409
 
 
 
 /**
  * There is no content to send for this request, but the headers may be useful.
  *
  * @type {number}
  * @desc 204 No Content
  */
  module.exports.USER_CONFLECT = 409
 
 /**
  * The user has sent too many requests in a given amount of time ("rate limiting").
  *
  * @type {number}
  * @desc 422 Unprocessable Entity
  */
 module.exports.STATUS_UNPROCESSABLE_ENTITY = 422
 
 
 /**
  * The user has sent too many requests in a given amount of time ("rate limiting").
  *
  * @type {number}
  * @desc 429 Too Many Requests
  */
 module.exports.STATUS_TOO_MANY_REQUEST = 429
 
 
 /**
  * The server has encountered a situation it doesn't know how to handle.
  *
  * @type {number}
  * @desc 500 Internal Server Error
  */
 module.exports.STATUS_SERVER_ERROR = 500
 
 
 /**
  * The request method is not supported by the server and cannot be handled.
  *
  * @type {number}
  * @desc 501 Not Implemented
  */
 module.exports.STATUS_NOT_IMPLEMENTED = 501
 
 
 /**
  * This error response means that the server,
  * while working as a gateway to get a response needed to handle the request, got an invalid response.
  *
  * @type {number}
  * @desc 502 Bad Gateway
  */
 module.exports.STATUS_BAD_GATEWAY = 502
 
 
 /**
  * The server is not ready to handle the request. Common causes are a server that is down for maintenance or that is overloaded.
  *
  * @type {number}
  * @desc 503 Service Unavailable
  */
 module.exports.STATUS_SERVICE_UNAVAILABLE = 503
 
 
 /**
  * This error response is given when the server is acting as a gateway and cannot get a response in time.
  *
  * @type {number}
  * @desc 504 Gateway Timeout
  */
 module.exports.STATUS_GATEWAY_TIMEOUT = 504
 