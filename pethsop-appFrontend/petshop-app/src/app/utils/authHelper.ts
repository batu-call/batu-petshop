"use client";

export const isMobile = () => {
  if (typeof window === "undefined") return false;
  
  const userAgent = navigator.userAgent || navigator.vendor;
  
  return /android|iphone|ipad|ipod|mobile/i.test(userAgent);
};

export const saveAuthToken = (token: string) => {
  if (isMobile()) {
    localStorage.setItem("authToken", token);
  }
};


export const getAuthToken = () => {
  if (isMobile()) {
    return localStorage.getItem("authToken");
  }
  return null; 
};


export const clearAuthToken = () => {
  if (isMobile()) {
    localStorage.removeItem("authToken");
  }
};