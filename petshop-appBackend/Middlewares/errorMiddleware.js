class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorMiddleware = (error, req, res, next) => {
  let err = { ...error };

  err.message = error.message || "Internal Server Error";
  err.statusCode = error.statusCode || 500;

 
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    err = new ErrorHandler(
      `Duplicate value entered for ${field}`,
      400
    );
  }

  if (error.name === "JsonWebTokenError") {
    err = new ErrorHandler(
      "Json Web Token is invalid, Try Again!",
      401
    );
  }

 
  if (error.name === "TokenExpiredError") {
    err = new ErrorHandler(
      "Json Web Token has expired, Please login again!",
      401
    );
  }

 
  if (error.name === "CastError") {
    err = new ErrorHandler(
      `Invalid ${error.path}`,
      400
    );
  }

  const errorMessage = err.errors
    ? Object.values(err.errors)
        .map((e) => e.message)
        .join(", ")
    : err.message;

  return res.status(err.statusCode).json({
    success: false,
    message: errorMessage,
  });
};

export default ErrorHandler;
