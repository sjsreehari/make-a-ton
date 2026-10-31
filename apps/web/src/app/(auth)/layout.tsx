export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-screen w-full items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-6">
      {children}
    </div>
  );
}
