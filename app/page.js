"use client";
import { Hero } from "@/components/landing/hero";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { Testimonials } from "@/components/landing/testimonials";
import { FAQ } from "@/components/landing/faq";
import { CTA } from "@/components/landing/cta";
import Link from "next/link";

export default function Page(){
  return (
    <div className="relative bg-background text-foreground overflow-x-hidden">
      <Hero />
      <FeatureGrid />
      <Testimonials />
      <FAQ />
      <CTA />
      <footer className="py-16 px-6 md:px-16 text-center border-t border-border bg-background/80">
        <p className="opacity-60 mb-4">© 2025 FairHireAI. All rights reserved.</p>
        <div className="space-x-6 text-sm">
          <Link href="#hero" className="hover:underline">Top</Link>
          <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
          <Link href="/contact" className="hover:underline">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
