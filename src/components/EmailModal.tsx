"use client";

import { useState } from "react";
import { EmailService } from "@/services/emailService";

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (email: string) => Promise<void>;
}

export function EmailModal({ isOpen, onClose, onSend }: EmailModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSend = async () => {
    if (!EmailService.validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await onSend(email);
      setShowSuccess(true);
      // Hide success message after 1 second and close modal
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      setError("Failed to send email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault(); // Prevent default form submission
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md space-y-6 p-8 mx-8 rounded-xl bg-[radial-gradient(circle_at_center,theme(colors.purple.600),theme(colors.purple.900))] text-white">
        {showSuccess ? (
          <div className="text-center py-8">
            <div className="text-2xl mb-2 text-green-400">✓</div>
            <div className="text-lg font-medium">Email Sent!</div>
          </div>
        ) : (
          <>
            <div className="text-lg mb-4 text-center">Send trivia results to:</div>

            <div className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded bg-purple-800 border border-purple-500 text-white placeholder-purple-300 focus:outline-none focus:border-blue-500"
                disabled={isLoading}
              />

              {error && <div className="text-red-400 text-sm">{error}</div>}

              <div className="flex justify-center gap-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-purple-900 hover:bg-purple-700 text-white rounded-md transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                      Sending...
                    </>
                  ) : (
                    "Send"
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
