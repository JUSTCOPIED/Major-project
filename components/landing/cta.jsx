"use client";
import Link from "next/link";
import { motion } from "framer-motion";
export function CTA(){
  return (
    <section id="cta" className="scroll-mt-24 py-24 sm:py-28 text-center px-6 md:px-12 lg:px-20 max-w-5xl mx-auto">
      <motion.div initial={{opacity:0,scale:0.95}} whileInView={{opacity:1,scale:1}} transition={{duration:0.6}} className="p-10 rounded-sm border border-border bg-card text-card-foreground space-y-6">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Make Hiring Your Competitive Edge</h2>
        <p className="text-base md:text-lg opacity-80 max-w-2xl mx-auto">Start in minutes. Empower recruiters, ops & engineering with a single source of hiring truth.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signin" className="h-11 px-8 inline-flex items-center justify-center rounded-sm bg-primary text-primary-foreground font-semibold shadow hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring">Create Account</Link>
          <Link href="/login" className="h-11 px-8 inline-flex items-center justify-center rounded-sm border border-border hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-ring">I already have one</Link>
        </div>
      </motion.div>
    </section>
  );
}
