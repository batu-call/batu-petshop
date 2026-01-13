"use client";

import Navbar from "@/app/Navbar/page";
import Sidebar from "@/app/Sidebar/page";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import Fluffycat from '@/assets/about_us_fluffycat.png';
import Happygolden from '@/assets/about_us_Happygolden.png';
import sarahImage from '@/assets/Sarah.png'
import mikeImage from '@/assets/Mike.png'
import emilyImage from '@/assets/Emily.png'
import leoImage from '@/assets/Leo.png'
import GroupsIcon from '@mui/icons-material/Groups';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import PetsIcon from '@mui/icons-material/Pets';
import HandshakeIcon from '@mui/icons-material/Handshake';
import Footer from "@/app/Footer/page";
import { Button } from "@/components/ui/button";

interface TeamMemberProps {
  name: string;
  title: string;
  image: string | StaticImageData;
  quote: string;
}

export default function HomePage() {
  return (
    <div>
      <Navbar />
      <Sidebar />
      <main className="flex-1">
        {/* Our Story & Mission Section */}
        <section className="px-4 md:px-20 lg:px-40 py-10 bg-white">
          <div className="max-w-[1200px] mx-auto flex flex-col gap-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="flex flex-col gap-6">
                <span className="text-color font-bold tracking-widest uppercase text-sm">
                  Our Journey
                </span>
                <h2 className="text-[#393E46] text-4xl md:text-5xl font-black leading-tight tracking-tight">
                  Our Story &amp; Mission
                </h2>
                <p className="text-[#393E46]/80 text-lg leading-relaxed">
                  What started as a small family-run corner shop in 2010 has blossomed into a community hub for pet lovers. Our passion for animal welfare isn't just a business model—it's the heartbeat of everything we do. We believe every pet deserves a happy, healthy life, and every owner deserves a partner they can trust.
                </p>
                <div className="flex gap-4 items-center">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#97cba9] rounded-full text-primary flex items-center justify-center">
                      <GroupsIcon className="text-3xl text-color" />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-[#393E46]">Community First</p>
                      <p className="text-sm text-gray-500">
                        Supporting local shelters and adoption events yearly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="w-full aspect-[4/3] rounded-2xl shadow-xl relative overflow-hidden">
                  <Image
                    src={Fluffycat}
                    alt="Staff member smiling while brushing a fluffy cat"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-primary p-6 rounded-2xl shadow-lg hidden md:block">
                  <p className="text-[#393E46] text-4xl font-black">14+</p>
                  <p className="text-[#393E46] font-medium">Years of Care</p>
                </div>
              </div>
            </div>

            {/* Features Inline */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Quality Nutrition */}
              <div className="flex flex-col gap-4 p-8 bg-background-light rounded-2xl border border-transparent hover:border-primary/30 transition-all">
                <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-xl text-[#393E46]">
                  <span className="material-symbols-outlined text-2xl"><RestaurantIcon className="text-3xl text-color" /></span>
                </div>
                <h3 className="text-xl font-bold text-[#393E46]">Quality Nutrition</h3>
                <p className="text-gray-600 text-sm leading-normal">
                  We only stock vet-approved, premium organic foods formulated for optimal pet health and longevity.
                </p>
              </div>

              {/* Ethical Sourcing */}
              <div className="flex flex-col gap-4 p-8 bg-background-light rounded-2xl border border-transparent hover:border-primary/30 transition-all">
                <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-xl text-[#393E46]">
                  <span className="material-symbols-outlined text-2xl"><LocalFloristIcon className="text-3xl text-color" /></span>
                </div>
                <h3 className="text-xl font-bold text-[#393E46]">Ethical Sourcing</h3>
                <p className="text-gray-600 text-sm leading-normal">
                  Our products come from sustainable and ethical local partners who share our commitment to the planet.
                </p>
              </div>

              {/* Pet Expertise */}
              <div className="flex flex-col gap-4 p-8 bg-background-light rounded-2xl border border-transparent hover:border-primary/30 transition-all">
                <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-xl text-[#393E46]">
                  <span className="material-symbols-outlined text-2xl"><PetsIcon className="text-3xl text-color" /></span>
                </div>
                <h3 className="text-xl font-bold text-[#393E46]">Pet Expertise</h3>
                <p className="text-gray-600 text-sm leading-normal">
                  Our team consists of certified groomers and nutritionists dedicated to your pet's specific needs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="px-4 md:px-20 lg:px-40 py-24 bg-background-light">
          <div className="max-w-[1200px] mx-auto text-center mb-16">
            <span className="text-color font-bold tracking-widest uppercase text-sm">The Faces Behind the Care</span>
            <h2 className="text-[#393E46] text-4xl font-black leading-tight tracking-tight mt-2">Meet Our Team</h2>
            <div className="h-1.5 w-20 bg-primary mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-color2">
            <TeamMember
              name="Sarah Johnson"
              title="Founder & Owner"
              image={sarahImage}
              quote="Loves Golden Retrievers"
            />
            <TeamMember
              name="Mike Chen"
              title="Head Groomer"
              image={mikeImage}
              quote="The Cat Whisperer"
            />
            <TeamMember
              name="Dr. Emily White"
              title="Pet Nutritionist"
              image={emilyImage}
              quote="Vet Consultant"
            />
            <TeamMember
              name="Leo Smith"
              title="Store Manager"
              image={leoImage}
              quote="Rescue Advocate"
            />
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="px-4 py-20 bg-primary/10">
          <div className="max-w-200 mx-auto text-center flex flex-col items-center gap-8">
            <h2 className="text-3xl md:text-4xl font-black text-[#393E46]">
              Ready to give your pet the best?
            </h2>
            <p className="text-lg text-[#393E46] leading-relaxed">
              Come visit our shop or browse our collection online. We can't wait to meet you and your furry friend!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/AllProduct">
                <Button className="bg-primary text-[#393E46] font-bold py-4 px-8 rounded-xl shadow-md transition duration-300 ease-in-out hover:scale-105 cursor-pointer hover:bg-[#D6EED6]">
                  Shop Collection
                </Button>
              </Link>
              <Link href="/Contact">
                <Button className="bg-white border-2 border-primary text-primary font-bold py-4 px-8 rounded-xl transition duration-300 ease-in-out hover:scale-105 hover:text-[#393E46] hover:bg-[#D6EED6] cursor-pointer">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    <Footer/>
    </div>
  );
}

function TeamMember({ name, title, image, quote }: TeamMemberProps) {
  return (
    <div className="flex flex-col gap-4 text-center group">
      <div className="relative overflow-hidden rounded-full border-4 border-white shadow-lg group-hover:border-[#97cba9] transition-all
                      w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 mx-auto">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110 rounded-full"
        />
      </div>
      <div>
        <p className="text-[#393E46] text-lg font-bold">{name}</p>
        <p className="text-color2 text-sm font-semibold uppercase tracking-wide">{title}</p>
        <p className="text-gray-500 text-sm mt-2 font-medium italic">{quote}</p>
      </div>
    </div>
  );
}
