"use client";
import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/authContext";
import Image from "next/image";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import CircularText from "@/components/CircularText";
import Footer from "@/app/Footer/page";
import { useRouter } from "next/navigation";
import { User, Mail, Camera, Save, X, Trash2 } from "lucide-react";
import DeleteAccountModal from "./components/DeleteAccountModal";
import ZoomModal from "./components/ZoomModal";


type FormDataType = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

const MyProfile = () => {
  const router = useRouter();
  const { user, setUser, isAuthenticated, loading: authLoading, deleteAccount } = useContext(AuthContext);

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoomImages, setZoomImages] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState<FormDataType>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/Login");
  }, [isAuthenticated, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof FormDataType;
    setFormData((prev) => ({ ...prev, [name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    try {
      const data = new FormData();
      (Object.keys(formData) as (keyof FormDataType)[]).forEach((key) => data.append(key, formData[key]));
      if (file) data.append("avatar", file);

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/update`,
        data,
        { withCredentials: true },
      );

      if (response.data.success) {
        toast.success("Profile updated!");
        if (response.data.user) setUser(response.data.user);
        setFile(null);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error((error as AxiosError<{ message: string }>).response?.data?.message || "Update failed");
      } else {
        toast.error(error instanceof Error ? error.message : "Update failed");
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?._id) { toast.error("User not found"); return; }
    try {
      await deleteAccount(user._id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete account");
    } finally {
      setShowDeleteModal(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-primary dark:bg-[#0E5F44] z-50">
        <CircularText text="LOADING" spinDuration={20} className="text-white text-3xl sm:text-4xl" />
      </div>
    );
  }

  const avatarUrl = file ? URL.createObjectURL(file) : user?.avatar;

  return (
    <>
      <style>{`
        .profile-phone .react-tel-input .form-control { border: 1px solid #d1d5db !important; }
        .profile-phone .react-tel-input .flag-dropdown { border: 1px solid #d1d5db !important; border-right: none !important; }
        .dark .profile-phone .react-tel-input .form-control { border: 1px solid #B1CBBB !important; }
        .dark .profile-phone .react-tel-input .flag-dropdown { border: 1px solid #B1CBBB !important; border-right: none !important; }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0d1f18] dark:to-[#162820] py-4 px-4 sm:px-6 lg:px-8 lg:py-12 xl:py-18">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-[#162820] rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-white/10">

            {/* Header */}
            <div className="bg-gradient-to-r from-secondary to-green-300 dark:from-[#0b8457] dark:to-[#2d5a3d] px-6 py-8 sm:px-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-color dark:text-[#c8e6d0] flex items-center gap-3">
                <User className="w-8 h-8" />
                Personal Information
              </h1>
            </div>

            <div className="p-6 sm:p-8">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  <div
                    className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 dark:border-[#2d5a3d] shadow-lg cursor-pointer transition-transform hover:scale-105"
                    onClick={() => avatarUrl && setZoomImages([avatarUrl])}
                  >
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt="Profile" fill priority sizes="128px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-[#1e3d2a] flex items-center justify-center">
                        <User className="w-16 h-16 text-gray-400 dark:text-[#7aab8a]" />
                      </div>
                    )}
                  </div>
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary dark:bg-[#0b8457] text-white p-3 rounded-full cursor-pointer shadow-lg hover:bg-green-600 dark:hover:bg-[#2d5a3d] transition-colors">
                    <Camera className="w-5 h-5" />
                    <input id="avatar-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
                <p className="mt-3 text-sm text-gray-500 dark:text-[#7aab8a]">Change Photo</p>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-[#a8d4b8] mb-2">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-[#7aab8a]" />
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Enter first name"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0d1f18] text-gray-900 dark:text-[#c8e6d0] placeholder-gray-400 dark:placeholder-[#7aab8a] focus:ring-2 focus:ring-primary dark:focus:ring-[#2d5a3d] focus:border-transparent transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-[#a8d4b8] mb-2">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-[#7aab8a]" />
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Enter last name"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0d1f18] text-gray-900 dark:text-[#c8e6d0] placeholder-gray-400 dark:placeholder-[#7aab8a] focus:ring-2 focus:ring-primary dark:focus:ring-[#2d5a3d] focus:border-transparent transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-[#a8d4b8] mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-[#7aab8a]" />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter email"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0d1f18] text-gray-900 dark:text-[#c8e6d0] placeholder-gray-400 dark:placeholder-[#7aab8a] focus:ring-2 focus:ring-primary dark:focus:ring-[#2d5a3d] focus:border-transparent transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-[#a8d4b8] mb-2">Phone Number</label>
                  <div className="profile-phone">
                    <PhoneInput
                      country="tr"
                      value={formData.phone}
                      onChange={(phone) => setFormData({ ...formData, phone })}
                      inputStyle={{ width: "100%", height: "48px", borderRadius: "8px", paddingLeft: "60px", fontSize: "16px" }}
                      buttonStyle={{ border: "none", background: "transparent", borderRadius: "8px 0 0 8px" }}
                      dropdownStyle={{ borderRadius: "8px" }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 rounded-lg border border-red-200 dark:border-red-800/50 font-medium text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Delete Account</span>
                  <span className="sm:hidden">Delete</span>
                </button>

                <div className="flex gap-3 w-full sm:w-auto">
                  <button onClick={() => router.back()} className="flex-1 sm:flex-none px-6 py-3 rounded-lg border border-gray-200 dark:border-white/10 font-bold text-sm text-gray-700 dark:text-[#a8d4b8] hover:bg-gray-50 dark:hover:bg-[#1e3d2a] flex items-center justify-center gap-2 transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] cursor-pointer">
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button onClick={handleSubmit} className="flex-1 sm:flex-none px-6 py-3 rounded-lg bg-primary dark:bg-[#0b8457] text-white font-bold text-sm hover:bg-[#D6EED6] dark:hover:bg-[#2d5a3d] flex items-center justify-center gap-2 shadow-lg transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] cursor-pointer hover:text-[#393E46] dark:hover:text-[#c8e6d0]">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteAccountModal
          onConfirm={handleDeleteAccount}
          onClose={() => setShowDeleteModal(false)}
        />
      )}

      {zoomImages.length > 0 && (
        <ZoomModal
          images={zoomImages}
          initialIndex={0}
          label={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`}
          onClose={() => setZoomImages([])}
        />
      )}

      <Footer />
    </>
  );
};

export default MyProfile;