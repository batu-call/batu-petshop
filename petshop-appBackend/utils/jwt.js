export const generateToken = (user, message, statusCode, res) => {
    const token = user.generateJsonWebToken();
    const cookieName = user.role === "Admin" ? "AdminToken" : "UserToken";
    
    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "None", 
        path: "/", 
        expires: new Date(
            Date.now() + Number(process.env.COOKIE_EXPIRES || 7) * 24 * 60 * 60 * 1000
        ),

    };

    console.log("[Token Generation]", {
        cookieName,
        userRole: user.role,
        email: user.email,
        cookieOptions: {
            ...cookieOptions,
            expires: cookieOptions.expires.toISOString(),
        }
    });

    res.status(statusCode)
        .cookie(cookieName, token, cookieOptions)
        .json({
            success: true,
            message,
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                address: user.address,
                avatar: user.avatar,
                role: user.role,
            },
            token, 
        });
    
    console.log("✅ [Token Generation] Cookie set successfully");
};

export default generateToken;