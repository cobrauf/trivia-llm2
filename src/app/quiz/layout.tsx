export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-purple-900">
      {children}
    </main>
  );
}
