"use client";

import React from "react";
import Sidebar from "../Sidebar/page";
import Navbar from "../Navbar/page";

import StorefrontIcon from "@mui/icons-material/Storefront";
import AddLocationIcon from "@mui/icons-material/AddLocation";
import AddCallIcon from "@mui/icons-material/AddCall";
import EmailIcon from "@mui/icons-material/Email";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";


const position: [number, number] = [41.015137, 28.97953];

const Contact = () => {
 
  
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

  return (
    <div className="relative">
      <Navbar />
      <Sidebar />

      <div className="lg:ml-40">
        <main className="flex-grow flex justify-center py-10 px-4 lg:px-40">
          <div className="max-w-[1000px] w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

            {/* LEFT – FORM */}
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <h1 className="text-4xl lg:text-5xl font-black dark:text-white">
                  Get in Touch
                </h1>
                <p className="text-slate-500 dark:text-[#a2c398] text-lg">
                  Have a question about a puppy or need grooming advice?
                </p>
              </div>

              <form className="flex flex-col gap-5">
                <input
                  className="rounded-xl h-14 px-4 border dark:bg-input-bg dark:text-white"
                  placeholder="Your Full Name"
                />
                <input
                  className="rounded-xl h-14 px-4 border dark:bg-input-bg dark:text-white"
                  placeholder="you@example.com"
                  type="email"
                />
                <textarea
                  className="rounded-xl min-h-[140px] px-4 py-3 border dark:bg-input-bg dark:text-white"
                  placeholder="Your message"
                />
                <button className="rounded-full bg-primary h-14 text-background-dark font-bold">
                  Send Message
                </button>
              </form>
            </div>

            {/* RIGHT – INFO + MAP */}
            <div className="flex flex-col gap-8">

              {/* INFO CARDS */}
              <div className="grid gap-4">
                <InfoCard icon={<AddLocationIcon />} title="Visit Us" value="123 Puppy Lane, Barksville" />
                <div className="grid grid-cols-2 gap-4">
                  <InfoCard icon={<AddCallIcon />} title="Call Us" value="(555) 123-4567" />
                  <InfoCard icon={<EmailIcon />} title="Email Us" value="hello@paws.com" />
                </div>
              </div>

              {/* MAP */}
              <div className="relative w-full min-h-[400px] rounded-3xl overflow-hidden shadow-xl border dark:border-border-dark">

                <MapContainer
                  center={position}
                  zoom={15}
                  className="absolute inset-0 w-full h-full"
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={position} icon={markerIcon}>
                    <Popup>We are here!</Popup>
                  </Marker>
                </MapContainer>

                {/* CENTER OVERLAY */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 pointer-events-none">
                  <div className="bg-primary p-3 rounded-full shadow-lg animate-bounce">
                    <StorefrontIcon />
                  </div>
                  <div className="bg-black/50 text-white text-xs px-3 py-1 rounded-full mt-2">
                    We are here!
                  </div>
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Contact;

/* Small reusable component */
const InfoCard = ({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) => (
  <div className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-surface-dark border dark:border-border-dark">
    <div className="size-12 flex items-center justify-center rounded-full bg-primary/20 text-primary">
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="font-bold dark:text-white">{value}</p>
    </div>
  </div>
);
