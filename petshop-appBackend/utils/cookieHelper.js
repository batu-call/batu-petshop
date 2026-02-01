export const getCookieOptions = () => {
  return {
    httpOnly: true,
    secure: true,       
    sameSite: "none",   
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
};

export const getClearCookieOptions = () => {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    expires: new Date(0),
  };
};