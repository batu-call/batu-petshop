"use client";
import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import { Button } from "@/components/ui/button";
import Box from "@mui/material/Box";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { useAdminAuth } from "@/app/Context/AdminAuthContext";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import CircularText from "@/components/CircularText";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import Image from "next/image";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useTheme } from "next-themes";
import { ShieldCheck, UserCog, Lock, BadgeCheck, KeyRound } from "lucide-react";

const AddAdmin = () => {
  const router = useRouter();
  const { setAdmin } = useAdminAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  type formDataType = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    address: string;
  };

  const [formData, setFormData] = useState<formDataType>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handlerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const data = new FormData();
      for (const key in formData) {
        data.append(key, formData[key as keyof formDataType]);
      }
      if (file) data.append("avatar", file);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/add`,
        data,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setAdmin(response.data.admin);
        router.push("/main");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong!");
    }
  };

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const textFieldSx = {
    "& .MuiInput-underline:after": { borderBottomColor: "#B1CBBB" },
    "& .MuiInputBase-input": { color: "inherit" },
  };

  const labelSx = {
    sx: {
      color: "#B1CBBB",
      "&.Mui-focused": {
        color: isDark ? "#393E46" : "#ffffff",
        backgroundColor: "#B1CBBB",
        padding: 0.4,
        borderRadius: 1,
      },
    },
  };

  const adminPerks = [
    { icon: <ShieldCheck className="w-4 h-4" />, text: "Full dashboard access" },
    { icon: <UserCog className="w-4 h-4" />, text: "Manage users & orders" },
    { icon: <BadgeCheck className="w-4 h-4" />, text: "Verified admin privileges" },
    { icon: <KeyRound className="w-4 h-4" />, text: "Restricted to authorized staff" },
  ];

  return (
    <div className="h-full w-full relative">
      {loading ? (
        <div className="md:ml-24 lg:ml-40 fixed inset-0 flex justify-center items-center bg-primary z-50">
          <CircularText
            text="LOADING"
            spinDuration={20}
            className="text-white text-4xl"
          />
        </div>
      ) : (
        <div className="p-4 flex items-center justify-center min-h-full">
          <div className="w-full max-w-5xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">

            {/* LEFT PANEL — Admin themed */}
            <div className="hidden md:flex w-1/2 relative flex-col justify-between bg-gradient-to-br from-[#0d1f18] via-[#0f2a1e] to-[#0b1a13] p-10 overflow-hidden">
              {/* Decorative background rings */}
              <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full border border-[#97cba9]/10" />
              <div className="absolute -top-8 -left-8 w-48 h-48 rounded-full border border-[#97cba9]/10" />
              <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full border border-[#97cba9]/10" />
              <div className="absolute -bottom-10 -right-10 w-52 h-52 rounded-full border border-[#97cba9]/10" />

              {/* Subtle grid texture */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, #97cba9 0px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #97cba9 0px, transparent 1px, transparent 40px)",
                }}
              />

              {/* Top badge */}
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-[#97cba9]/10 border border-[#97cba9]/20 rounded-full px-4 py-1.5 mb-8">
                  <Lock className="w-3 h-3 text-[#97cba9]" />
                  <span className="text-[#97cba9] text-xs font-bold uppercase tracking-widest">
                    Admin Portal
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-[#97cba9]/15 border border-[#97cba9]/30 p-3 rounded-2xl">
                    <ShieldCheck className="w-8 h-8 text-[#97cba9]" />
                  </div>
                  <div>
                    <h2 className="text-white text-2xl font-black leading-tight">
                      New Admin
                    </h2>
                    <p className="text-[#97cba9]/70 text-sm">Registration</p>
                  </div>
                </div>

                <p className="text-[#97cba9]/60 text-sm leading-relaxed mb-8">
                  You are creating a privileged account with full access to the
                  Petshop management system. Only authorized personnel should
                  be registered here.
                </p>

                {/* Perk list */}
                <div className="space-y-3">
                  {adminPerks.map((perk, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="text-[#97cba9] bg-[#97cba9]/10 p-1.5 rounded-lg shrink-0">
                        {perk.icon}
                      </div>
                      <span className="text-[#97cba9]/80 text-sm">{perk.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom warning */}
              <div className="relative z-10 mt-8 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                <div className="flex items-start gap-2">
                  <UserCog className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-amber-400/80 text-xs leading-relaxed">
                    Admin accounts have unrestricted access to all data and
                    settings. Ensure this person is trusted staff.
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT FORM */}
            <div className="w-full md:w-1/2 p-8 md:p-10 lg:p-12 bg-white dark:bg-[#162820] flex flex-col justify-center">
              {/* Mobile-only top badge */}
              <div className="flex md:hidden items-center gap-2 mb-5 bg-[#97cba9]/10 border border-[#97cba9]/30 rounded-full px-4 py-1.5 w-fit">
                <ShieldCheck className="w-3.5 h-3.5 text-[#97cba9]" />
                <span className="text-[#0b8457] dark:text-[#97cba9] text-xs font-bold uppercase tracking-widest">
                  Admin Portal
                </span>
              </div>

              <form onSubmit={handlerSubmit}>
                <Box display="flex" flexDirection="column" gap={2.5} width="100%">
                  <div className="mb-2">
                    <h2 className="text-3xl font-bold mb-1 text-color dark:text-[#0b8457]!">
                      Create Admin
                    </h2>
                    <p className="text-[#6d7e73] dark:text-[#7aab8a] text-sm">
                      Fill in the details to register a new admin account.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextField
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      variant="standard"
                      fullWidth
                      autoComplete="given-name"
                      slotProps={{
                        inputLabel: labelSx,
                        input: { sx: { color: "inherit" } },
                      }}
                      sx={textFieldSx}
                    />
                    <TextField
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      variant="standard"
                      fullWidth
                      autoComplete="family-name"
                      slotProps={{
                        inputLabel: labelSx,
                        input: { sx: { color: "inherit" } },
                      }}
                      sx={textFieldSx}
                    />
                    <div className="sm:col-span-2">
                      <TextField
                        label="Admin Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        variant="standard"
                        fullWidth
                        autoComplete="email"
                        slotProps={{
                          inputLabel: labelSx,
                          input: { sx: { color: "inherit" } },
                        }}
                        sx={textFieldSx}
                      />
                    </div>
                    <div className="sm:col-span-2 mt-4">
                      <PhoneInput
                        country={"us"}
                        value={formData.phone}
                        inputProps={{ autoComplete: "tel" }}
                        onChange={(phone) =>
                          setFormData({ ...formData, phone })
                        }
                        inputStyle={{
                          width: "100%",
                          height: "48px",
                          borderRadius: "8px",
                          border: "1px solid #B1CBBB",
                          backgroundColor: isDark ? "#0d1f18" : "#ffffff",
                          color: isDark ? "#c8e6d0" : "#393E46",
                        }}
                        buttonStyle={{
                          backgroundColor: isDark ? "#162820" : "#ffffff",
                          border: "1px solid #B1CBBB",
                          borderRight: "none",
                        }}
                        dropdownStyle={{
                          backgroundColor: isDark ? "#162820" : "#ffffff",
                          color: isDark ? "#c8e6d0" : "#393E46",
                        }}
                        specialLabel="Admin Phone"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <TextField
                        label="Admin Password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        variant="standard"
                        fullWidth
                        autoComplete="new-password"
                        slotProps={{
                          input: {
                            sx: { color: "inherit" },
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() =>
                                    setShowPassword((prev) => !prev)
                                  }
                                  edge="end"
                                >
                                  {showPassword ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                          inputLabel: labelSx,
                        }}
                        sx={textFieldSx}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <TextField
                        label="Office Address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        variant="standard"
                        fullWidth
                        multiline
                        minRows={2}
                        autoComplete="street-address"
                        slotProps={{
                          inputLabel: labelSx,
                          input: { sx: { color: "inherit" } },
                        }}
                        sx={textFieldSx}
                      />
                    </div>
                  </div>

                  {/* Avatar upload */}
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={2}
                    mt={2}
                    p={1.5}
                    className="border border-gray-200 dark:border-white/10 rounded-xl"
                  >
                    <div className="relative cursor-pointer">
                      <div className="relative w-16 h-16 rounded-full border-2 border-dashed border-[#97cba9]/50 flex items-center justify-center overflow-hidden">
                        {file ? (
                          <Image
                            src={URL.createObjectURL(file)}
                            alt="Admin Avatar"
                            fill
                            className="object-cover rounded-full"
                          />
                        ) : (
                          <AddAPhotoIcon
                            fontSize="small"
                            className="text-[#97cba9]"
                          />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-xs text-color dark:text-[#c8e6d0]">
                        Admin Profile Photo
                      </p>
                      <p className="text-xs text-gray-500 dark:text-[#7aab8a]">
                        JPG or PNG · Will appear on the dashboard
                      </p>
                    </div>
                  </Box>

                  <Button
                    type="submit"
                    className="w-full mt-2 rounded-[20px] bg-primary text-[#393E46] hover:bg-[#D6EED6] cursor-pointer transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] hover:shadow-md flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-md font-semibold">
                      Register Admin Account
                    </span>
                  </Button>
                </Box>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddAdmin;