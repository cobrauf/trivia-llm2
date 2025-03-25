"use client";

import { useEffect } from "react";

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (sessionStorage.getItem("quiz_questions")) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-violet-950 to-gray-950">
      {children}
    </main>
  );
}
