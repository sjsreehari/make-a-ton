import Link from "next/link";

interface LogoProps {
  href?: string;
}

export function Logo({ href = "/dashboard" }: LogoProps) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5 shrink-0 group py-1" aria-label="BillPilot">
      <div className="size-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-0.5 shadow-md shadow-indigo-500/20 flex items-center justify-center transition-transform group-hover:scale-105">
        <div className="w-full h-full bg-zinc-950 rounded-[6px] flex items-center justify-center">
          <svg className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 19 21 12 17 5 21 12 2" />
          </svg>
        </div>
      </div>
      <div className="hidden md:flex flex-col text-left">
        <span className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-1.5">
          BillPilot
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Brightloop</span>
        </span>
        <span className="text-[10px] text-muted-foreground font-mono">Subscription Ops</span>
      </div>
    </Link>
  );
}
