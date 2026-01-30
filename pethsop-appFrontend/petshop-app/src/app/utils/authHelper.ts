
"use client";

export const isMobile = () => {
  if (typeof window === "undefined") return false;
  
  const userAgent = navigator.userAgent || navigator.vendor;
  const mobile = /android|iphone|ipad|ipod|mobile/i.test(userAgent);
  
  console.log("🔍 isMobile check:", mobile, "UserAgent:", userAgent);
  return mobile;
};

export const saveAuthToken = (token: string) => {
  console.log("💾 Saving token, isMobile:", isMobile());
  if (isMobile()) {
    localStorage.setItem("authToken", token);
    console.log("✅ Token saved to localStorage:", token.substring(0, 20) + "...");
  } else {
    console.log("⏭️ Desktop - skipping localStorage (using cookie)");
  }
};

export const getAuthToken = () => {
  const mobile = isMobile();
  if (mobile) {
    const token = localStorage.getItem("authToken");
    console.log("🔑 Getting token from localStorage:", token ? token.substring(0, 20) + "..." : "null");
    return token;
  }
  console.log("🍪 Desktop - token from cookie");
  return null;
};

export const clearAuthToken = () => {
  console.log("🗑️ Clearing token, isMobile:", isMobile());
  if (isMobile()) {
    localStorage.removeItem("authToken");
    console.log("✅ Token cleared from localStorage");
  }
};