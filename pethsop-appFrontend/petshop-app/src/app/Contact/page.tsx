"use client";

import React, { useContext, useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import toast from "react-hot-toast";

import AddLocationIcon from "@mui/icons-material/AddLocation";
import AddCallIcon from "@mui/icons-material/AddCall";
import EmailIcon from "@mui/icons-material/Email";

import Footer from "../Footer/page";
import { AuthContext } from "../context/authContext";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";

const CircularText = dynamic(() => import("@/components/CircularText"), { ssr: false });

const StoreMap = dynamic(() => import("../components/StoreMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-200 dark:bg-[#1e3d2a] animate-pulse rounded-3xl" />
  ),
});

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast("Please log in to contact us.");
      router.push("/Login");
      return;
    }
    setLoading(true);
    

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/message/add`,
        formData,
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Message sent successfully!");
        setFormData({ name: "", email: "", subject: "General Inquiry", message: "" });
      } else {
        toast.error(res.data.error || "Something went wrong!");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.error || "Something went wrong!");
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Unknown error!");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "h-12 sm:h-14 px-4 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#0d1f18] text-gray-900 dark:text-[#c8e6d0] placeholder-gray-400 dark:placeholder-[#7aab8a] focus:outline-none focus:ring-2 focus:ring-[#97cba9] dark:focus:ring-[#2d5a3d] transition-all";

  return (
    <>
      {/* LOADING */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary dark:bg-[#0E5F44]">
          <CircularText text="LOADING" spinDuration={20} className="text-white text-3xl sm:text-4xl" />
        </div>
      )}

      {/* PAGE */}
      <div className="flex-1 min-h-screen bg-[#fafafa] dark:bg-[#162820] px-4 sm:px-6 md:px-12 lg:px-24 xl:px-40 py-10 lg:py-24 flex flex-col items-center">
        <div className="w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">

          {/* LEFT — FORM */}
          <div className="flex flex-col gap-6 sm:gap-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-color dark:text-[#c8e6d0]">
              Get in Touch
            </h1>
            <p className="text-slate-600 dark:text-[#a8d4b8] text-base sm:text-lg">
              Have a question about a puppy or need grooming advice? Drop us a message below!
            </p>

            <form className="flex flex-col gap-4 sm:gap-5" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Your Full Name"
                value={formData.name}
                onChange={handleChange}
                className={inputClass}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className={inputClass}
                required
              />
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`${inputClass} cursor-pointer`}
              >
                <option>General Inquiry</option>
                <option>Adoption</option>
                <option>Grooming Services</option>
                <option>Vet Consultation</option>
              </select>
              <textarea
                name="message"
                placeholder="How can we help you and your furry friend?"
                value={formData.message}
                onChange={handleChange}
                className="min-h-[120px] sm:min-h-[140px] px-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#0d1f18] text-gray-900 dark:text-[#c8e6d0] placeholder-gray-400 dark:placeholder-[#7aab8a] focus:outline-none focus:ring-2 focus:ring-[#97cba9] dark:focus:ring-[#2d5a3d] resize-none transition-all"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="mt-2 sm:mt-4 h-12 sm:h-14 bg-primary dark:bg-[#0b8457] text-color dark:text-[#c8e6d0] font-bold rounded-full shadow-lg hover:scale-[1.02] hover:bg-[#D6EED6] dark:hover:bg-[#2d5a3d] transition-all disabled:opacity-50 cursor-pointer"
              >
                Send Message
              </button>

              {formData.email && (
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-[#7aab8a] -mt-2 px-1">
                  <Mail className="w-3 h-3 shrink-0 text-[#97cba9] dark:text-[#7aab8a]" />
                  <span>
                    We'll get back to you at{" "}
                    <span className="font-bold text-[#97cba9] dark:text-[#7aab8a]">{formData.email}</span>
                  </span>
                </div>
              )}
            </form>
          </div>

          {/* RIGHT — INFO + MAP */}
          <div className="flex flex-col gap-6 sm:gap-8">
            <div className="grid gap-4">
              <InfoCard icon={<AddLocationIcon />} title="Visit Us" value="742 Evergreen Terrace, Springfield, USA" />
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 text-sm">
                <InfoCard icon={<AddCallIcon />} title="Call Us" value="+1 (415) 555-0199" />
                <InfoCard icon={<EmailIcon />} title="Email Us" value="contact@batupetshop.com" />
              </div>
            </div>

            {/* MAP */}
            <div className="relative w-full h-[250px] sm:h-[300px] md:h-[400px] rounded-3xl overflow-hidden shadow-xl border border-gray-200 dark:border-white/10">
              <StoreMap />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Contact;

const InfoCard = ({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) => (
  <div className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1e3d2a] border border-gray-100 dark:border-white/10 shadow-sm dark:shadow-none">
    <div className="p-3 bg-[#97cba9] dark:bg-[#0b8457] rounded-full text-color dark:text-[#c8e6d0] shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs sm:text-sm text-slate-500 dark:text-[#7aab8a]">{title}</p>
      <p className="font-bold text-slate-900 dark:text-[#c8e6d0] break-words [overflow-wrap:anywhere]">{value}</p>
    </div>
  </div>
);