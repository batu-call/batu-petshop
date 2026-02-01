"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import toast from "react-hot-toast";

import AddLocationIcon from "@mui/icons-material/AddLocation";
import AddCallIcon from "@mui/icons-material/AddCall";
import EmailIcon from "@mui/icons-material/Email";

import CircularText from "@/components/CircularText";
import Footer from "../Footer/page";

const StoreMap = dynamic(() => import("../components/StoreMap"), {
  ssr: false,
});

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/message/add`,
        formData,
        { withCredentials: true },
      );

      if (res.data.success) {
        toast.success("Message sent successfully!");
        setFormData({
          name: "",
          email: "",
          subject: "General Inquiry",
          message: "",
        });
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

  return (
    <>
      {/* LOADING OVERLAY */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary">
          <CircularText
            text="LOADING"
            spinDuration={20}
            className="text-white text-3xl sm:text-4xl"
          />
        </div>
      )}

      {/* PAGE */}
      <div className="flex-1 min-h-screen bg-[#fafafa] px-4 sm:px-6 md:px-12 lg:px-24 xl:px-40 py-10 flex flex-col items-center">
        <div className="w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
          {/* LEFT – FORM */}
          <div className="flex flex-col gap-6 sm:gap-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-color">
              Get in Touch
            </h1>

            <p className="text-slate-600 text-base sm:text-lg">
              Have a question about a puppy or need grooming advice? Drop us a
              message below!
            </p>

            <form
              className="flex flex-col gap-4 sm:gap-5"
              onSubmit={handleSubmit}
            >
              <input
                type="text"
                name="name"
                placeholder="Your Full Name"
                value={formData.name}
                onChange={handleChange}
                className="h-12 sm:h-14 px-4 rounded-xl border border-gray-300 bg-white"
                required
              />

              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="h-12 sm:h-14 px-4 rounded-xl border border-gray-300 bg-white"
                required
              />

              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="h-12 sm:h-14 px-4 rounded-xl border border-gray-300 bg-white"
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
                className="min-h-[120px] sm:min-h-[140px] px-4 py-3 rounded-xl border border-gray-300 bg-white resize-none"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="mt-2 sm:mt-4 h-12 sm:h-14 bg-primary text-background-dark font-bold rounded-full shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* RIGHT – INFO + MAP */}
          <div className="flex flex-col gap-6 sm:gap-8">
            <div className="grid gap-4">
              <InfoCard
                icon={<AddLocationIcon />}
                title="Visit Us"
                value="742 Evergreen Terrace, Springfield, USA"
              />

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 text-sm">
                <InfoCard
                  icon={<AddCallIcon />}
                  title="Call Us"
                  value="+1 (415) 555-0199"
                />
                <InfoCard
                  icon={<EmailIcon />}
                  title="Email Us"
                  value="contact@batupetshop.com"
                />
              </div>
            </div>

            {/* MAP */}
            <div className="relative w-full h-[250px] sm:h-[300px] md:h-[400px] rounded-3xl overflow-hidden shadow-xl border">
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

/* INFO CARD */
const InfoCard = ({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) => (
  <div className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-white border shadow-sm">
    <div className="p-3 bg-[#97cba9] rounded-full text-color">{icon}</div>
    <div>
      <p className="text-xs sm:text-sm text-slate-500">{title}</p>
      <p className="font-bold text-slate-900 break-all sm:break-normal">
        {value}
      </p>
    </div>
  </div>
);
