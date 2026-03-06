"use client";

import { Mail, Eye, CheckCircle, Reply } from "lucide-react";
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
        className="bg-white dark:bg-card w-full max-w-lg rounded-xl shadow-lg p-6 flex flex-col overflow-y-auto max-h-[85vh] transform transition-transform duration-300 border border-transparent dark:border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-border pb-4">
          <h2 className="text-xl font-bold text-color dark:text-foreground">Message Detail</h2>
          <button
            className="text-gray-500 dark:text-muted-foreground hover:text-gray-800 dark:hover:text-foreground text-2xl font-bold cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-accent transition-colors"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 text-sm">
          <div>
            <span className="font-semibold text-color dark:text-foreground">Name: </span>
            <span className="text-color/80 dark:text-muted-foreground">{openMessage.name}</span>
          </div>
          <div>
            <span className="font-semibold text-color dark:text-foreground">Email: </span>
            <span className="text-color/80 dark:text-muted-foreground">{openMessage.email}</span>
          </div>
          <div>
            <span className="font-semibold text-color dark:text-foreground">Subject: </span>
            <span className="text-color/80 dark:text-muted-foreground">{openMessage.subject}</span>
          </div>
          <div className="bg-gray-50 dark:bg-accent p-4 rounded-lg overflow-auto whitespace-pre-wrap break-words max-h-60 border border-gray-100 dark:border-border">
            <p className="font-semibold text-color dark:text-foreground mb-2">Message:</p>
            <p className="text-color/80 dark:text-muted-foreground leading-relaxed">{openMessage.message}</p>
          </div>
          <div>
            <span className="font-semibold text-color dark:text-foreground">Date: </span>
            <span className="text-color/80 dark:text-muted-foreground">{formatDate(openMessage.date)}</span>
          </div>
          <div>
            <span className="font-semibold text-color dark:text-foreground">Current Status: </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ml-2 ${
              openMessage.status === "New"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                : openMessage.status === "Read"
                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
            }`}>
              {getStatusIcon(openMessage.status)}
              {openMessage.status || "New"}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex mt-6 justify-end gap-2">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 dark:bg-accent text-gray-800 dark:text-foreground rounded-lg hover:bg-gray-300 dark:hover:bg-accent/70 transition-colors font-medium text-sm"
          >
            Close
          </button>
          <button
            onClick={onReply}
            disabled={openMessage.status === "Replied"}
            className="px-5 py-2 bg-[#97cba9] dark:bg-primary text-white dark:text-primary-foreground rounded-lg hover:bg-[#7fb894] dark:hover:opacity-90 transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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