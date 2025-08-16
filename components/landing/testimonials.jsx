"use client";
import { motion } from "framer-motion";
const quotes = [
  { name:"Jane – Director Talent", quote:"We cut bias flags by half in 6 weeks." },
  { name:"Leo – CTO", quote:"Their explainability dashboards unlocked stakeholder trust." },
  { name:"Amara – People Ops", quote:"Candidate experience scores jumped immediately." }
];
export function Testimonials(){
  return (
    <section id="testimonials" className="scroll-mt-24 py-28 max-w-6xl mx-auto px-6 md:px-12 lg:px-20">
      <h2 className="text-3xl md:text-4xl font-bold mb-10 tracking-tight">Loved by Modern Talent Teams</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {quotes.map((q,i)=>(
          <motion.figure key={q.name} initial={{opacity:0,y:15}} whileInView={{opacity:1,y:0}} transition={{duration:0.5, delay:i*0.1}} className="p-6 rounded-sm border border-border bg-card text-card-foreground flex flex-col gap-4">
            <p className="text-sm leading-relaxed italic">“{q.quote}”</p>
            <figcaption className="text-xs uppercase tracking-wide opacity-70">{q.name}</figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}
