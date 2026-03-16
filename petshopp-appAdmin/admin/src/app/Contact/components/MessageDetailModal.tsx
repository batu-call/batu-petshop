"use client";

import { Mail, Eye, CheckCircle, Reply, X } from "lucide-react";
import { Message } from "../hooks/useMessages";

type Props = {
  openMessage: Message;
  onClose: () => void;
  onReply: () => void;
  formatDate: (dateStr?: string) => string;
};

const getStatusIcon = (status?: "New" | "Read" | "Replied") => {
  switch (status) {
    case "New": return <Mail className="w-4 h-4" />;
    case "Read": return <Eye className="w-4 h-4" />;
    case "Replied": return <CheckCircle className="w-4 h-4" />;
    default: return <Mail className="w-4 h-4" />;
  }
};

const MessageDetailModal = ({ openMessage, onClose, onReply, formatDate }: Props) => {
  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1e3d2a] w-full max-w-lg rounded-xl shadow-lg overflow-hidden max-h-[85vh] flex flex-col border border-gray-200 dark:border-[#2d5a3d]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-[#2d5a3d] bg-gray-50 dark:bg-[#162820]">
          <h2 className="text-lg font-bold text-color dark:text-[#c8e6d0]">Message Detail</h2>
          <button
            className="text-gray-500 dark:text-[#7aab8a] hover:text-gray-800 dark:hover:text-[#c8e6d0] w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-[#2d5a3d] transition-colors cursor-pointer"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-3 text-sm p-6 overflow-y-auto">

          {[
            { label: "Name", value: openMessage.name },
            { label: "Email", value: openMessage.email },
            { label: "Subject", value: openMessage.subject },
            { label: "Date", value: formatDate(openMessage.date) },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5 border-b border-gray-100 dark:border-[#2d5a3d] pb-3">
              <span className="text-xs text-gray-400 dark:text-[#7aab8a] uppercase tracking-wide">{label}</span>
              <span className="text-gray-800 dark:text-[#c8e6d0] font-medium">{value}</span>
            </div>
          ))}

          {/* Status */}
          <div className="flex flex-col gap-0.5 border-b border-gray-100 dark:border-[#2d5a3d] pb-3">
            <span className="text-xs text-gray-400 dark:text-[#7aab8a] uppercase tracking-wide">Status</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium w-fit mt-0.5 ${
              openMessage.status === "New"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                : openMessage.status === "Read"
                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
            }`}>
              {getStatusIcon(openMessage.status)}
              {openMessage.status || "New"}
            </span>
          </div>

          {/* Message box */}
          <div className="mt-1 bg-gray-50 dark:bg-[#162820] border border-gray-200 dark:border-[#2d5a3d] rounded-lg p-4">
            <p className="text-xs text-gray-400 dark:text-[#7aab8a] uppercase tracking-wide mb-2">Message</p>
            <p className="text-gray-800 dark:text-[#c8e6d0] leading-relaxed whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
              {openMessage.message}
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 dark:border-[#2d5a3d] bg-gray-50 dark:bg-[#162820]">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white dark:bg-[#1e3d2a] text-gray-700 dark:text-[#c8e6d0] rounded-lg border border-gray-300 dark:border-[#2d5a3d] hover:bg-gray-100 dark:hover:bg-[#2d5a3d] transition-colors font-medium text-sm cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={onReply}
            disabled={openMessage.status === "Replied"}
            className="px-5 py-2 bg-primary dark:bg-[#0b8457] text-white rounded-lg hover:bg-primary/90 dark:hover:bg-[#0b8457]/80 transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Reply className="w-4 h-4" />
            {openMessage.status === "Replied" ? "Already Replied" : "Reply via Email"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageDetailModal;