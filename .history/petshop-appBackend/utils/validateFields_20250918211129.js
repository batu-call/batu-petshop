import ErrorHandler from '../Middlewares/errorMiddleware.js'; 

export const validateFields = (fields, next) => {
  const missingFields = Object.entries(fields)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingFields.length > 0) {
    return next(new ErrorHandler(`Missing fields: ${missingFields.join(", ")}`, 400));
  }
};