"use client";
import { motion } from "framer-motion";
import Link from "next/link";
export function Hero(){
  return (
    <section id="hero" className="relative min-h-[90dvh] flex flex-col items-center justify-center text-center gap-8 pt-20 scroll-mt-24">
      <motion.h1 initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} transition={{duration:0.7}} className="text-5xl md:text-7xl font-black leading-tight tracking-tight max-w-5xl mx-auto">
        Fair, Transparent & Data-Driven Hiring Intelligence
      </motion.h1>
      <motion.p initial={{opacity:0}} whileInView={{opacity:1}} transition={{delay:0.2,duration:0.7}} className="text-base md:text-xl max-w-2xl mx-auto opacity-80">
        Detect bias, surface hidden talent, and optimize every decision with explainable AI built for responsible recruitment.
      </motion.p>
      <motion.div initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} transition={{delay:0.35}} className="flex flex-col sm:flex-row items-center gap-4">
        <Link href="/signin" className="h-11 px-8 inline-flex items-center justify-center rounded-sm bg-primary text-primary-foreground font-semibold shadow hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring">Get Started Free</Link>
        <Link href="#features" className="h-11 px-8 inline-flex items-center justify-center rounded-sm border border-border hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-ring">Explore Features</Link>
      </motion.div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 w-full max-w-4xl">
        {[
          ['92%','Bias reduction potential'],
          ['70%','Faster screening'],
          ['35%','Retention lift'],
          ['24/7','Monitoring']
        ].map(([num,label])=> (
          <div key={label} className="p-4 rounded-sm border border-border bg-card text-card-foreground flex flex-col items-center gap-1">
            <span className="text-2xl font-bold tracking-tight">{num}</span>
            <span className="text-[11px] uppercase opacity-70 text-center">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
