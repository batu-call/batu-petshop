import axios from "axios";

export const saveGoogleUser = async (profile: any) => {
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/google-login`,
      {
        email: profile.email,
        name: profile.name,
        image: profile.picture,
      },
      { withCredentials: true }
    );

    return data;
  } catch (err) {
    console.error("Google user save failed:", err);
    return null;
  }
};
