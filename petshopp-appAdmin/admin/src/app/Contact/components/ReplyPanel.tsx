"use client";

import { Mail, X, Send } from "lucide-react";
import { ReplyPanel as ReplyPanelType } from "../hooks/useMessages";

type Props = {
  replyPanel: ReplyPanelType;
  setReplyPanel: (r: ReplyPanelType) => void;
  onClose: () => void;
  onSend: () => void;
  formatDate: (dateStr?: string) => string;
};

const ReplyPanel = ({ replyPanel, setReplyPanel, onClose, onSend, formatDate }: Props) => {
  if (!replyPanel.isOpen || !replyPanel.message) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 h-screen w-full md:w-[600px] lg:w-[700px] bg-white dark:bg-card shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300 border-l border-transparent dark:border-border">

        {/* Panel Header */}
        <div className="bg-gradient-to-r from-[#97cba9] to-[#7fb894] dark:from-[#0E5F44] dark:to-[#0b8457] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Send Email Reply</h2>
                <p className="text-white/80 text-sm">This will be sent to the customer's email</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Sender info */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              {replyPanel.message.avatar ? (
                <div
                  className="bg-center bg-no-repeat bg-cover rounded-full w-10 h-10 shrink-0 ring-2 ring-white/30"
                  style={{ backgroundImage: `url("${replyPanel.message.avatar}")` }}
                />
              ) : (
                <div className="flex items-center justify-center rounded-full w-10 h-10 shrink-0 font-bold text-sm bg-white/20 text-white ring-2 ring-white/30">
                  {replyPanel.message.initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white truncate">{replyPanel.message.name}</p>
                <p className="text-white/70 text-sm truncate flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {replyPanel.message.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white dark:bg-card">

          {/* Original Message */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-foreground mb-2">
              Original Message
            </label>
            <div className="bg-gray-50 dark:bg-accent border border-gray-200 dark:border-border rounded-lg p-4">
              <div className="mb-2">
                <span className="text-xs text-gray-500 dark:text-muted-foreground uppercase tracking-wide">Subject:</span>
                <p className="font-semibold text-gray-900 dark:text-foreground">{replyPanel.message.subject}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-muted-foreground uppercase tracking-wide">Message:</span>
                <p className="text-gray-700 dark:text-muted-foreground mt-1 whitespace-pre-wrap">
                  {replyPanel.message.message}
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-border">
                <span className="text-xs text-gray-500 dark:text-muted-foreground">
                  Received: {formatDate(replyPanel.message.date)}
                </span>
              </div>
            </div>
          </div>

          {/* Reply Textarea */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-foreground mb-2">
              Your Email Reply
            </label>
            <textarea
              placeholder="Type your reply here... This will be sent as an email to the customer."
              value={replyPanel.replyText}
              onChange={(e) => setReplyPanel({ ...replyPanel, replyText: e.target.value })}
              rows={12}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-border bg-white dark:bg-accent text-gray-900 dark:text-foreground placeholder-gray-400 dark:placeholder-muted-foreground focus:ring-2 focus:ring-[#97cba9] dark:focus:ring-primary focus:border-transparent transition-all resize-none"
            />
            <p className="text-sm text-gray-500 dark:text-muted-foreground mt-2">
              {replyPanel.replyText.length} characters
            </p>
          </div>

          {/* Email Preview */}
          {replyPanel.replyText && (
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800/50">
              <p className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Preview
              </p>
              <div className="bg-white dark:bg-card rounded-lg p-4 shadow-sm border border-transparent dark:border-border">
                <p className="text-gray-900 dark:text-foreground font-semibold mb-2">
                  Re: {replyPanel.message.subject}
                </p>
                <p className="text-gray-700 dark:text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {replyPanel.replyText}
                </p>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-border">
                  <p className="text-sm text-gray-500 dark:text-muted-foreground italic">
                    Best regards,
                    <br />
                    Petshop Support Team
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-border p-6 bg-gray-50 dark:bg-accent/50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={replyPanel.sending}
              className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 dark:border-border font-bold text-gray-700 dark:text-foreground hover:bg-gray-100 dark:hover:bg-accent transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onSend}
              disabled={replyPanel.sending || !replyPanel.replyText.trim()}
              className="flex-1 px-6 py-3 rounded-lg bg-[#97cba9] dark:bg-primary text-white dark:text-primary-foreground font-bold hover:bg-[#7fb894] dark:hover:opacity-90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {replyPanel.sending ? "Sending Email..." : "Send Email Reply"}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-muted-foreground text-center mt-3 flex items-center justify-center gap-1">
            <Mail className="w-3 h-3" />
            Email will be sent to{" "}
            <span className="font-bold text-[#97cba9] dark:text-primary">{replyPanel.message?.email}</span>
          </p>
        </div>
      </div>
    </>
  );
};

export default ReplyPanel;