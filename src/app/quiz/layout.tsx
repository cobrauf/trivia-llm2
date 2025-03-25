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
    <main className="min-h-screen bg-[radial-gradient(circle_at_center,theme(colors.purple.900),theme(colors.gray.900))]">
      {children}
    </main>
  );
}

//bg-[radial-gradient(circle_at_center,theme(colors.purple.600),theme(colors.purple.900))]
