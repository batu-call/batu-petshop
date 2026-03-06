"use client";
import React from "react";
import Image from "next/image";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Admin } from "../hooks/useAdminList";

interface Props {
  selectedAdmin: Admin | null;
  setSelectedAdmin: (a: Admin | null) => void;
  handleDelete: (id: string) => void;
}

const AdminDrawer = ({ selectedAdmin, setSelectedAdmin, handleDelete }: Props) => {
  return (
    <Drawer
      direction="right"
      open={!!selectedAdmin}
      onOpenChange={(open) => { if (!open) setSelectedAdmin(null); }}
    >
      <DrawerContent className="h-[100dvh] sm:max-w-[400px] sm:ml-auto dark:bg-[#162820] dark:border-[#2d5a3d]">
        <DrawerHeader>
          <DrawerTitle className="text-color2 dark:text-[#a8d4b8]">Admin Details</DrawerTitle>
          <DrawerDescription className="text-sm text-gray-500 dark:text-[#7aab8a]">
            View detailed information about this admin
          </DrawerDescription>
        </DrawerHeader>

        {selectedAdmin && (
          <div className="no-scrollbar overflow-y-auto px-4 pb-6 flex flex-col items-center gap-4">
            <div className="w-36 h-36 relative shrink-0">
              <Image
                src={selectedAdmin.avatar || "/default-avatar.png"}
                alt="admin"
                fill
                sizes="144px"
                className="object-cover rounded-lg border-2 dark:border-[#2d5a3d]"
              />
            </div>

            <div className="w-full text-center px-2">
              <h2 className="text-xl font-semibold dark:text-[#c8e6d0] break-words leading-snug hyphens-auto line-clamp-3">
                {selectedAdmin.firstName} {selectedAdmin.lastName}
              </h2>
            </div>

            <div className="w-full text-center px-2">
              <p className="text-sm text-gray-500 dark:text-[#7aab8a] break-all">{selectedAdmin.email}</p>
            </div>

            <div className="w-full">
              <PhoneInput country="us" value={selectedAdmin.phone} disabled inputStyle={{ width: "100%" }} />
            </div>

            <div className="w-full">
              <p className="text-xs text-gray-500 dark:text-[#7aab8a] mb-1 text-center">Address</p>
              <div className="w-full max-h-32 overflow-y-auto rounded-md border dark:border-[#2d5a3d] bg-gray-50 dark:bg-[#0d1f18] p-3 text-sm text-gray-700 dark:text-[#c8e6d0] text-left break-words whitespace-pre-wrap">
                {selectedAdmin.address || "No address provided"}
              </div>
            </div>

            <div className="w-full">
              <p className="text-xs text-gray-500 dark:text-[#7aab8a] mb-1 text-center">Registered</p>
              <p className="text-center text-sm text-gray-700 dark:text-[#a8d4b8]">
                {new Date(selectedAdmin.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <span className="px-3 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold">
              {selectedAdmin.role}
            </span>
          </div>
        )}

        <DrawerFooter>
          <Button
            variant="destructive"
            onClick={() => handleDelete(selectedAdmin!._id)}
            className="bg-primary dark:bg-[#0b8457] hover:bg-[#D6EED6] dark:hover:bg-[#2d5a3d] hover:text-[#393E46] dark:hover:text-[#c8e6d0] cursor-pointer transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97]"
          >
            Delete Admin
          </Button>
          <DrawerClose asChild>
            <Button
              variant="outline"
              className="dark:bg-[#1e3d2a] dark:text-[#a8d4b8] dark:border-[#2d5a3d] dark:hover:bg-[#2d5a3d] transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] cursor-pointer"
            >
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default AdminDrawer;