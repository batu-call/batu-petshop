"use client";
import React, { useState } from "react";
import { Trash2 } from "lucide-react";

interface DeleteAccountModalProps {
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ onConfirm, onClose }) => {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText.toUpperCase() !== "DELETE") return;
    setIsDeleting(true);
    await onConfirm();
    setIsDeleting(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => !isDeleting && onClose()}
    >
      <div
        className="bg-white dark:bg-[#162820] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-[#c8e6d0]">Delete Account</h2>
        </div>

        <p className="text-gray-600 dark:text-[#a8d4b8] mb-4">
          This action <span className="font-bold text-red-600 dark:text-red-400">cannot be undone</span>.
          This will permanently delete your account and remove all of your data from our servers.
        </p>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800 dark:text-yellow-400 font-medium mb-2">
            Please type <span className="font-bold">DELETE</span> to confirm:
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE here"
            disabled={isDeleting}
            className="w-full px-4 py-2 border border-yellow-300 dark:border-yellow-700 rounded-lg bg-white dark:bg-[#0d1f18] text-gray-900 dark:text-[#c8e6d0] placeholder-gray-400 dark:placeholder-[#7aab8a] focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 font-bold text-sm text-gray-700 dark:text-[#a8d4b8] hover:bg-gray-50 dark:hover:bg-[#1e3d2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting || confirmText.toUpperCase() !== "DELETE"}
            className="flex-1 px-4 py-3 rounded-lg bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Deleting...</>
            ) : (
              <><Trash2 className="w-4 h-4" />Delete Account</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;