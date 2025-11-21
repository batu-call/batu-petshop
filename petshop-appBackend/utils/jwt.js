 export const generateToken = (user,message,statusCode,res) => {
    const token = user.generateJsonWebToken();
    const cookieName = user.role === "Admin" ? "AdminToken" : "UserToken"
    res.status(statusCode).cookie(cookieName,token,{
        httpOnly:true,
        secure:false,
        sameSite:"Lax",
        expires:new Date(Date.now() + Number(process.env.COOKIE_EXPIRES *24*60*60*1000))
    })
    .json({
        success:true,
        message,
        user,
        token
    })
}


export default generateToken;