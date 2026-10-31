import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fbfbfa] text-[#1c1b1a] px-4">
      <h1 className="text-6xl font-bold font-serif mb-3 text-[#1c1b1a]">404</h1>
      <p className="text-lg text-[#6e6d6a] mb-6">Page not found</p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-full text-xs font-semibold bg-[#1c1b1a] hover:bg-black text-white shadow-sm transition-all"
      >
        Return to Home
      </Link>
    </div>
  );
}

