import { User } from "../Models/userSchema.js";
import { LoginActivity } from "../Models/LoginActivitySchema.js";
import { Session } from "../Models/sessionSchema.js";

export const getAnalytics = async (req, res, next) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000); // 6 gün önceyi alıyoruz
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // 1) Users who logged in in the last 7 days
    const weeklyActiveUsers = await LoginActivity.distinct("userId", { loginAt: { $gte: sevenDaysAgo } });

    // 2) Users currently active (logged in last 5 minutes)
    const activeCutoff = new Date(now.getTime() - 5 * 60 * 1000);
    const activeNow = await LoginActivity.distinct("userId", { loginAt: { $gte: activeCutoff } });

    // 3) Users registered today
    const todayRegisteredUsers = await User.find({ createdAt: { $gte: todayStart }, role: 'User' }).countDocuments();
    const todayRegisteredAdmin = await User.find({ createdAt: { $gte: todayStart }, role: 'Admin' }).countDocuments();

    // 4) Last registered user
    const lastSignup = await User.findOne().sort({ createdAt: -1 }).select("firstName lastName createdAt");

    // 5) Average session duration
    const avgSessionRes = await Session.aggregate([
      { $match: { duration: { $exists: true } } },
      { $group: { _id: null, avgDurationMs: { $avg: "$duration" } } }
    ]);
    const avgSessionMs = (avgSessionRes[0] && avgSessionRes[0].avgDurationMs) || 0;

    // 6) Last 7 days login activity for bar chart
    const rawLoginData = await LoginActivity.aggregate([
      { $match: { loginAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { day: { $dateToString: { format: "%Y-%m-%d", date: "$loginAt" } } },
          users: { $sum: 1 }
        }
      },
      { $sort: { "_id.day": 1 } }
    ]);

    // Fill missing days with 0 users
    const last7DaysLogin = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dayStr = date.toISOString().split('T')[0];

      const found = rawLoginData.find(d => d._id.day === dayStr);
      last7DaysLogin.push({
        day: dayStr,
        users: found ? found.users : 0
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
        last7DaysLogin
      }
    });

  } catch (err) {
    next(err);
  }
};
