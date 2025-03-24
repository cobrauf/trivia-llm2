"use client";

interface ConfirmationModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  isOpen,
  message,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md space-y-8 p-8 ml-8 mr-8 rounded-xl bg-gradient-to-br from-purple-900 via-purple-700 to-purple-900 text-white text-center">
        <div className="text-lg mb-6">{message}</div>

        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-purple-900 hover:bg-purple-500 text-white rounded-md transition-colors"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-purple-900 hover:bg-purple-500 text-white rounded-md transition-colors"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
