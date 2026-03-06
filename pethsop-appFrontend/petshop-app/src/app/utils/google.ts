import axios from "axios";

export const saveGoogleUser = async (session: any) => {
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/google-login`,
      {
        idToken: session.idToken,
      },
      { withCredentials: true }
    );

    return data;
  } catch (err) {
    console.error("Google user save failed:", err);
    return null;
  }
};