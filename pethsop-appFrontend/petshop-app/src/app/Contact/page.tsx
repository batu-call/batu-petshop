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
    >
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
        { withCredentials: true }
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
      {loading && (
        <div className="md:ml-24 lg:ml-40 fixed inset-0 z-50 flex items-center justify-center bg-primary">
          <CircularText
            text="LOADING"
            spinDuration={20}
            className="text-white text-4xl"
          />
        </div>
      )}

      <div className="flex-1 flex flex-col items-center md:items-center min-h-screen bg-[#fafafa] px-4 md:px-20 lg:px-40 py-10">
        <div className="max-w-250 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* LEFT - Contact Form */}
          <div className="flex flex-col gap-8">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-color">
              Get in Touch
            </h1>
            <p className="text-slate-600 text-lg">
              Have a question about a puppy or need grooming advice? Drop us a
              message below!
            </p>

            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Your Full Name"
                value={formData.name}
                onChange={handleChange}
                className="h-14 px-4 rounded-xl border border-gray-300 bg-white"
              />

              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="h-14 px-4 rounded-xl border border-gray-300 bg-white"
              />

              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="h-14 px-4 rounded-xl border border-gray-300 bg-white"
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
                className="min-h-35 px-4 py-3 rounded-xl border border-gray-300 bg-white resize-none"
              />

              <button
                type="submit"
                className="mt-4 h-14 bg-primary text-background-dark font-bold rounded-full shadow-lg hover:scale-[1.02] transition-all"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* RIGHT - Info + Map */}
          <div className="flex flex-col gap-8">
            <div className="grid gap-4">
              <InfoCard
                icon={<AddLocationIcon />}
                title="Visit Us"
                value="123 Puppy Lane, Barksville"
              />
              <div className="grid grid-row md:grid-cols-2 gap-4 text-sm">
                <InfoCard
                  icon={<AddCallIcon />}
                  title="Call Us"
                  value="(555) 867-5309"
                />
                <InfoCard
                  icon={<EmailIcon />}
                  title="Email Us"
                  value="contact@pawzone-demo.com"
                />
              </div>
            </div>


            <div className="relative w-full h-[400px] rounded-3xl overflow-hidden shadow-xl border">
              <StoreMap />
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default Contact;

/* InfoCard */
const InfoCard = ({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) => (
  <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border shadow-sm">
    <div className="p-3 bg-[#97cba9] rounded-full text-color">{icon}</div>
    <div>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="font-bold text-slate-900">{value}</p>
    </div>
  </div>
);
