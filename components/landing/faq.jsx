"use client";
import { useState } from "react";
const faqs = [
  { q:"Is data secure?", a:"Yes. Encryption in transit & at rest, plus tenant isolation." },
  { q:"Can we tune fairness thresholds?", a:"Granular per-role threshold controls with audit trail." },
  { q:"What integrations exist?", a:"ATS, HRIS, calendar & video stack out-of-the-box." },
];
export function FAQ(){
  return (
    <section id="faq" className="scroll-mt-24 py-28 max-w-4xl mx-auto px-6 md:px-12 lg:px-20">
      <h2 className="text-3xl md:text-4xl font-bold mb-10 tracking-tight">Questions</h2>
      <div className="space-y-4">
        {faqs.map(f => <Item key={f.q} {...f} />)}
      </div>
    </section>
  );
}
function Item({q,a}){
  const [open,setOpen] = useState(false);
  return (
    <div className="border border-border rounded-sm">
      <button onClick={()=>setOpen(o=>!o)} className="w-full text-left px-4 py-3 flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-ring">
        <span className="font-medium">{q}</span>
        <span className="text-xs opacity-70">{open?'-':'+'}</span>
      </button>
      {open && <div className="px-4 pb-4 text-sm opacity-80 leading-relaxed">{a}</div>}
    </div>
  );
}
