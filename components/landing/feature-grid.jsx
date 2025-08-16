"use client";
import { motion } from "framer-motion";
const items = [
  { title:"Automated Screening", desc:"AI triage ranks candidates on skill & potential." },
  { title:"Bias Detection", desc:"Realtime disparity metrics & alerts." },
  { title:"Explainability", desc:"Every recommendation comes with rationale." },
  { title:"Skill Graph", desc:"Infer transferable capabilities beyond titles." },
  { title:"Interview Insights", desc:"Audio & video signals summarized." },
  { title:"Cultural Fit", desc:"Multi-dimensional values alignment scoring." }
];
export function FeatureGrid(){
  return (
    <section id="features" className="scroll-mt-24 py-28 max-w-6xl mx-auto px-6 md:px-12 lg:px-20">
      <h2 className="text-3xl md:text-4xl font-bold mb-12 tracking-tight">Platform Pillars</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((f,i)=> (
          <motion.div key={f.title} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} transition={{duration:0.5, delay:i*0.05}} className="group relative p-6 rounded-sm border border-border bg-card text-card-foreground overflow-hidden">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition bg-accent" />
            <h3 className="font-semibold mb-2 text-lg">{f.title}</h3>
            <p className="text-sm opacity-70 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
