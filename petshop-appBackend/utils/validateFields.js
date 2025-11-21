import ErrorHandler from '../Middlewares/errorMiddleware.js'; 

export const validateFields = (fields) => {
  const missingFields = Object.entries(fields)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingFields.length > 0) {
    return new ErrorHandler(`Missing fields: ${missingFields.join(", ")}`, 400);
  }

  return null;
};