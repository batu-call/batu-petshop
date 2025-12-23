"use client";

import React from "react";
import dynamic from "next/dynamic";
import Sidebar from "../Sidebar/page";
import Navbar from "../Navbar/page";

import AddLocationIcon from "@mui/icons-material/AddLocation";
import AddCallIcon from "@mui/icons-material/AddCall";
import EmailIcon from "@mui/icons-material/Email";


const StoreMap = dynamic(() => import("../components/StoreMap"), { ssr: false });

const Contact = () => {
  return (
    <div className="relative bg-white dark:bg-gray-900 min-h-screen">
      <Navbar />
      <Sidebar />

      <div className="lg:ml-40 px-4 lg:px-40 py-10 h-full">
        <main className="max-w-[1000px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* LEFT - Contact Form */}
          <div className="flex flex-col gap-8">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-color dark:text-white">
              Get in Touch
            </h1>
            <p className="text-slate-600 dark:text-[#a2c398] text-lg">
              Have a question about a puppy or need grooming advice? Drop us a message below!
            </p>

            <form className="flex flex-col gap-5">
              <label className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 dark:text-white mb-1">Name</span>
                <input
                  type="text"
                  placeholder="Your Full Name"
                  className="h-14 px-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-base dark:text-white placeholder-gray-400 dark:placeholder-[#a2c398]/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 dark:text-white mb-1">Email</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="h-14 px-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-base dark:text-white placeholder-gray-400 dark:placeholder-[#a2c398]/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 dark:text-white mb-1">Subject</span>
                <select className="h-14 px-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-base dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer">
                  <option>General Inquiry</option>
                  <option>Adoption</option>
                  <option>Grooming Services</option>
                  <option>Vet Consultation</option>
                </select>
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 dark:text-white mb-1">Message</span>
                <textarea
                  placeholder="How can we help you and your furry friend?"
                  className="min-h-[140px] px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-base dark:text-white placeholder-gray-400 dark:placeholder-[#a2c398]/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                />
              </label>

              <button className="mt-4 h-14 bg-primary text-background-dark font-bold rounded-full shadow-lg shadow-primary/20 hover:bg-[#D6EED6] hover:scale-[1.02] transition-all cursor-pointer">
                Send Message
              </button>
            </form>
          </div>

          {/* RIGHT - Info + Map */}
          <div className="flex flex-col gap-8">
            {/* Info Cards */}
            <div className="grid gap-4">
              <InfoCard icon={<AddLocationIcon />} title="Visit Us" value="123 Puppy Lane, Barksville" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-sm">
                  <InfoCard icon={<AddCallIcon />} title="Call Us" value="(555) 867‑5309"/>
                  </div>
                <InfoCard icon={<EmailIcon />} title="Email Us" value="contact@pawzone-demo.com" />
              </div>
            </div>

            {/* Map */}
            <div className="relative w-full min-h-[400px] rounded-3xl overflow-hidden shadow-xl border dark:border-gray-700">
              <StoreMap />

              {/* Center Overlay */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none flex flex-col items-center">


              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default Contact;

const InfoCard = ({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) => (
  <div className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:scale-[1.01]">
    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary">
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-[#a2c398]">{title}</p>
      <p className="font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  </div>
);
