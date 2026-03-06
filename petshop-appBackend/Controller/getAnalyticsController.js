import { User } from "../Models/userSchema.js";
import { LoginActivity } from "../Models/LoginActivitySchema.js";
import { Session } from "../Models/sessionSchema.js";

export const getAnalytics = async (req, res, next) => {
  try {
    const now = new Date();

    const todayStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0)
    );

    const sevenDaysAgo = new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000);


    const weeklyActiveUsers = await LoginActivity.distinct("userId", {
      loginAt: { $gte: sevenDaysAgo },
    });

    const activeCutoff = new Date(now.getTime() - 15 * 60 * 1000);
    const activeNow = await LoginActivity.distinct("userId", {
      loginAt: { $gte: activeCutoff },
    });


    const todayRegisteredUsers = await User.countDocuments({
      createdAt: { $gte: todayStart },
      role: "User",
    });

    const todayRegisteredAdmin = await User.countDocuments({
      createdAt: { $gte: todayStart },
      role: "Admin",
    });


    const lastSignup = await User.findOne()
      .sort({ createdAt: -1 })
      .select("firstName lastName createdAt");


    const avgSessionRes = await Session.aggregate([
      { 
        $match: { 
          duration: { 
            $exists: true, 
            $ne: null,
            $gt: 0  
          } 
        } 
      },
      { 
        $group: { 
          _id: null, 
          avgDurationMs: { $avg: "$duration" } 
        } 
      },
    ]);
    const avgSessionMs = avgSessionRes.length > 0 
      ? Math.round(avgSessionRes[0].avgDurationMs) 
      : 0;

    const rawLoginData = await LoginActivity.aggregate([
      { $match: { loginAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$loginAt",
                timezone: "UTC",
              },
            },
            userId: "$userId",
          },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          users: { $sum: 1 },  
        },
      },
      { $sort: { _id: 1 } },
    ]);

    
    const last7DaysLogin = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStr = date.toISOString().split("T")[0];

      const found = rawLoginData.find((d) => d._id === dayStr);

 
      const label = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      });

      last7DaysLogin.push({
        day: label,
        fullDate: dayStr,
        users: found ? found.users : 0,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        weeklyActiveUsers: weeklyActiveUsers.length,
        activeNow: activeNow.length,
        todayRegisteredUsers,
        todayRegisteredAdmin,
        lastSignup,
        avgSessionMs,
        last7DaysLogin,
      },
    });
  } catch (err) {
    next(err);
  }
};