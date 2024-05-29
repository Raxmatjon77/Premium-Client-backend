class NotFoundError extends Error {
  constructor(status, message) {
    super();
    this.status = status;
    this.name = "NotFoundError";
    this.message = message;
  }
}

class ForbiddenError extends Error {
  constructor(status, message) {
    super();
    this.status = status;
    this.name = "ForbiddenError";
    this.message = message;
  }
}

class ValidationError extends Error {
  constructor(status, message) {
    super();
    this.status = status;
    this.name = "ValidationError";
    this.message = message;
  }
}

class AuthorizationError extends Error {
  constructor(status, message) {
    super();
    this.status = status;
    this.name = "AuthorizationError";
    this.message = message;
  }
}

class InternalServerError extends Error {
  constructor(status, message) {
    super();
    this.status = status;
    this.name = "InternalServerError";
    this.message = message;
  }
}

class RateLimiting extends Error {
  constructor(status, message) {
    super();
    this.status = status;
    this.name = "RateLimiting";
    this.message = message;
  }
}

class BadRequestError extends Error {
  constructor(status, message) {
    super();
    this.status = status;
    this.name = "BadRequestError";
    this.message = message;
  }
}

class SessionExpiredError extends Error {
  constructor(status, message) {
    super();
    this.status = status;
    this.name = "SessionExpiredError";
    this.message = message;
  }
}

class InvalidTokenError extends Error {
  constructor(status, message) {
    super();
    this.status = status;
    this.name = "InvalidTokenError";
    this.message = message;
  }
}

class UnAvailableError extends Error {
  constructor(status, message) {
    super();
    this.status = status;
    this.name = "UnAvailableError";
    this.message = message;
  }
}

module.exports = {
  NotFoundError,
  ForbiddenError,
  ValidationError,
  AuthorizationError,
  InternalServerError,
  RateLimiting,
  BadRequestError,
  SessionExpiredError,
  InvalidTokenError,
  UnAvailableError,
};
