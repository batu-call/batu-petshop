import validator from "validator";
import mongoose from "mongoose";

export const sanitizeString = (input) => {
  if (input === null || input === undefined) return null;
  if (typeof input !== 'string') return String(input);
  return validator.escape(input.trim());
};

export const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    throw new Error('Invalid email format');
  }
  
  const trimmed = email.trim().toLowerCase();
  
  if (!validator.isEmail(trimmed)) {
    throw new Error('Invalid email format');
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(trimmed)) {
    throw new Error('Invalid email format');
  }
  
  return trimmed;
};

export const sanitizeObjectId = (id) => {
  if (!id) {
    throw new Error('ID is required');
  }
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid ID format');
  }
  
  return id;
};

export const sanitizePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    throw new Error('Invalid phone number');
  }
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length < 10 || cleaned.length > 15) {
    throw new Error('Phone number must be 10-15 digits');
  }
  
  return cleaned;
};

export const sanitizeNumber = (value, min = 0, max = Number.MAX_SAFE_INTEGER) => {
  const num = Number(value);
  
  if (isNaN(num)) {
    throw new Error('Invalid number');
  }
  
  if (num < min || num > max) {
    throw new Error(`Number must be between ${min} and ${max}`);
  }
  
  return num;
};

export const sanitizeBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return null;
};

export const sanitizeQuery = (query) => {
  if (!query || typeof query !== 'object') {
    return {};
  }
  
  const sanitized = {};
  
  for (const [key, value] of Object.entries(query)) {
    if (key.startsWith('$')) {
      console.warn(`Blocked NoSQL operator in query: ${key}`);
      continue;
    }
    
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const hasOperator = Object.keys(value).some(k => k.startsWith('$'));
      if (hasOperator) {
        console.warn(`Blocked nested NoSQL operator for key: ${key}`);
        continue;
      }
    }
    
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(v => 
        typeof v === 'string' ? sanitizeString(v) : v
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

export const escapeRegex = (text) => {
  if (typeof text !== 'string') return '';
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const createSafeRegex = (searchTerm, maxLength = 100) => {
  if (!searchTerm || typeof searchTerm !== 'string') {
    return null;
  }
  
  const trimmed = searchTerm.trim().slice(0, maxLength);
  
  if (trimmed.length === 0) {
    return null;
  }
  
  const escaped = escapeRegex(trimmed);
  
  return { $regex: escaped, $options: 'i' };
};

export const buildSafeFilter = (params) => {
  const filter = {};
  
  if (params.email) {
    try {
      filter.email = sanitizeEmail(params.email);
    } catch (error) {
      console.warn('Invalid email in filter:', error.message);
    }
  }
  
  if (params.search && typeof params.search === 'string') {
    const regex = createSafeRegex(params.search, 50);
    if (regex) {
      filter.$or = params.searchFields?.map(field => ({
        [field]: regex
      })) || [];
    }
  }
  
  if (params.status) {
    const validStatuses = params.validStatuses || [];
    if (validStatuses.includes(params.status)) {
      filter.status = params.status;
    }
  }
  
  if (params.role) {
    const validRoles = params.validRoles || ['User', 'Admin'];
    if (validRoles.includes(params.role)) {
      filter.role = params.role;
    }
  }
  
  if (params.isActive !== undefined) {
    const active = sanitizeBoolean(params.isActive);
    if (active !== null) {
      filter.isActive = active;
    }
  }
  
  if (params.isFeatured !== undefined) {
    const featured = sanitizeBoolean(params.isFeatured);
    if (featured !== null) {
      filter.isFeatured = featured;
    }
  }
  
  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    filter.price = {};
    if (params.minPrice !== undefined) {
      try {
        filter.price.$gte = sanitizeNumber(params.minPrice, 0);
      } catch (error) {
        console.warn('Invalid minPrice:', error.message);
      }
    }
    if (params.maxPrice !== undefined) {
      try {
        filter.price.$lte = sanitizeNumber(params.maxPrice, 0);
      } catch (error) {
        console.warn('Invalid maxPrice:', error.message);
      }
    }
  }
  
  if (params.startDate || params.endDate) {
    filter.createdAt = {};
    
    if (params.startDate) {
      const start = new Date(params.startDate);
      if (!isNaN(start.getTime())) {
        filter.createdAt.$gte = start;
      }
    }
    
    if (params.endDate) {
      const end = new Date(params.endDate);
      if (!isNaN(end.getTime())) {
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }
  }
  
  return filter;
};

export const buildSafeSortOptions = (sortBy, sortOrder, allowedFields = []) => {
  const safeSortBy = allowedFields.includes(sortBy) ? sortBy : allowedFields[0] || 'createdAt';
  const safeSortOrder = sortOrder === 'asc' ? 1 : -1;
  
  return { [safeSortBy]: safeSortOrder };
};

export const buildSafePagination = (page = 1, limit = 15, maxLimit = 100) => {
  const safePage = Math.max(1, parseInt(page) || 1);
  const safeLimit = Math.min(maxLimit, Math.max(1, parseInt(limit) || 15));
  const skip = (safePage - 1) * safeLimit;
  
  return { page: safePage, limit: safeLimit, skip };
};

export const validateRequiredFields = (data, requiredFields) => {
  const missing = [];
  
  for (const field of requiredFields) {
    if (!data[field]) {
      missing.push(field);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
};

export const validateOrderItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("No order items provided");
  }

  if (items.length > 100) {
    throw new Error("Too many items in order (max 100)");
  }

  for (const item of items) {
    sanitizeObjectId(item.product);
    
    const quantity = sanitizeNumber(item.quantity, 1, 999);
    if (quantity !== Math.floor(quantity)) {
      throw new Error("Quantity must be a whole number");
    }
  }
  
  return true;
};

export const validateShippingAddress = (address) => {
  if (!address || typeof address !== 'object') {
    throw new Error("Shipping address is required");
  }
  
  validateRequiredFields(address, ['fullName', 'city', 'address', 'email', 'phoneNumber']);
  
  return {
    fullName: sanitizeString(address.fullName),
    email: sanitizeEmail(address.email),
    city: sanitizeString(address.city),
    address: sanitizeString(address.address),
    phoneNumber: sanitizePhone(address.phoneNumber),
    postalCode: address.postalCode ? sanitizeString(address.postalCode) : undefined,
  };
};

export const validatePassword = (password, minLength = 6) => {
  if (!password || typeof password !== 'string') {
    throw new Error('Password is required');
  }
  
  if (password.length < minLength) {
    throw new Error(`Password must be at least ${minLength} characters`);
  }
  
  return true;
};
export default {
  sanitizeString,
  sanitizeEmail,
  sanitizeObjectId,
  sanitizePhone,
  sanitizeNumber,
  sanitizeBoolean,
  sanitizeQuery,
  escapeRegex,
  createSafeRegex,
  buildSafeFilter,
  buildSafeSortOptions,
  buildSafePagination,
  validateRequiredFields,
  validateOrderItems,
  validateShippingAddress,
  validatePassword,
};