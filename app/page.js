"use client";
import { EnhancedHero } from "../components/landing/enhanced-hero";
import { FeatureGrid } from "../components/landing/feature-grid";
import { TeamSection } from "../components/landing/team-section";
import { FAQ } from "../components/landing/faq";
import { CTA } from "../components/landing/cta";
import Link from "next/link";

export default function Page(){
  return (
    <div className="relative bg-background text-foreground overflow-x-hidden">
      <EnhancedHero />
      <FeatureGrid />
      <TeamSection />
      <FAQ />
      <CTA />
      <footer className="py-16 px-6 md:px-12 lg:px-20 border-t border-border bg-background/80">
        <div className="max-w-6xl mx-auto text-center">
          <p className="opacity-60 mb-6">© 2025 TestRunner Pro. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <Link href="#hero" className="hover:underline">Top</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
