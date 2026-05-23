import type { ReactNode } from "react";

import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";

import { authAssurances } from "../mock-auth-data";

type AuthCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footerLabel: string;
  footerHref: string;
  footerCta: string;
};

export function AuthCard({
  eyebrow,
  title,
  description,
  children,
  footerLabel,
  footerHref,
  footerCta,
}: AuthCardProps) {
  return (
    <section className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#111118]/92 p-5 shadow-[0_28px_100px_rgba(0,0,0,0.52)] sm:p-6 lg:p-8">
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div className="absolute -right-24 top-16 size-56 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative">
        <p className="text-xs font-black uppercase tracking-[0.26em] text-primary">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-black uppercase leading-tight text-white sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/68">
          {description}
        </p>

        <div className="mt-7">{children}</div>

        <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <LockKeyhole className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-black uppercase text-white">
                Security note
              </p>
              <ul className="mt-2 space-y-1 text-xs leading-5 text-white/62">
                {authAssurances.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-white/60">
          {footerLabel}{" "}
          <Link
            href={footerHref}
            className="inline-flex items-center gap-1 font-black text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            {footerCta}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </p>
      </div>
    </section>
  );
}
