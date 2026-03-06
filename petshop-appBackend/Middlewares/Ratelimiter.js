import rateLimit from 'express-rate-limit';


export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: "Too many password reset requests. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many accounts created. Please try again after 1 hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const googleLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many Google login attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// API LIMITERS 

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  
  max: 1000,                  
  message: {
    success: false,
    message: "Too many requests. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});


export const productBrowseLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 2000,                 
  message: {
    success: false,
    message: "Too many product requests. Please wait a moment.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.user?.role === 'admin';
  }
});


export const searchLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,  
  max: 100,                
  message: {
    success: false,
    message: "Too many search requests. Please wait a moment.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});


export const adminWriteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  
  max: 200,
  message: {
    success: false,
    message: "Too many admin operations. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});


export const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  
  max: 20,                  
  message: {
    success: false,
    message: "Too many order attempts. Please wait before trying again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});


export const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 20,
  message: {
    success: false,
    message: "Too many review operations. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});


export const messageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 50,
  message: {
    success: false,
    message: "Too many messages. Please wait before sending more.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const mailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  
  max: 5,                    
  message: {
    success: false,
    message: "Too many email attempts. Please try again after 1 hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const bulkEmailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  
  max: 10,                   
  message: {
    success: false,
    message: "Too many bulk email operations. Please wait.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});


export const couponLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 50,                    
  message: {
    success: false,
    message: "Too many coupon operations. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const cartLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200,                   
  message: {
    success: false,
    message: "Too many cart operations. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const favoriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: {
    success: false,
    message: "Too many favorite operations. Please wait a moment.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});


export const adminActionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  
  max: 300,
  message: {
    success: false,
    message: "Too many admin operations. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const userUpdateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  
  max: 20,
  message: {
    success: false,
    message: "Too many update attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const webhookLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  
  max: 1000, 
  message: {
    success: false,
    message: "Too many webhook requests.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});