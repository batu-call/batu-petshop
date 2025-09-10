class ErrorHandler extends Error {
    constructor (message,statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const errorMiddleware = (error,req,res,next) => {
    error.message = error.message || "Internal Server Error"; 
    error.statusCode = error.statusCode || 500; 
    
    if(error.code === 11000) {
        const message = `Dublicate ${Object.keys(error.keyValue)} Entered`;
        error = new ErrorHandler(message,400);
    }
    if(error.name === "JsonWebTokenError") {
        const message = "Json Web Token is invalid, Try Again!";
        error = new ErrorHandler(message,400);
    }
    if(error.name === "TokenExpieredError") {
        const message = "Json Web Token is invalid, Try Again!";
        error = new ErrorHandler(message,400);
    }
    if(error.name === "CastError") {
        const message = `Invalid ${error.path}`;
        error = new ErrorHandler(message,400);
    }  
    
    const errorMessage = error.errors 
    ? Object.values(error.errors)
    .map((error)=>error.message)
    .join("")
    :error.message;

    return res.status(error.statusCode).json({
        success:false,
        message :errorMessage,
    });
};


export default ErrorHandler;