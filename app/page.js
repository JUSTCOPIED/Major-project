"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// ====== Data ======
const sections = [
  { id: 'hero', title: 'AI-Powered Recruitment' },
  { id: 'features', title: 'Features' },
  { id: 'methodology', title: 'Our Methodology' },
  { id: 'testimonials', title: 'Testimonials' },
  { id: 'faq', title: 'FAQ' },
  { id: 'cta', title: 'Get Started' },
];
const features = [
  { title: 'Automated Screening', desc: 'Instant resume filtering.' },
  { title: 'Bias Detection', desc: 'Flag discrimination in real-time.' },
  { title: 'Cultural Fit', desc: 'Match values with AI.' },
  { title: 'Interview Insights', desc: 'Analyze soft-skills via video.' },
];
const testimonials = [
  { name: 'Jane', role: 'HR', text: '70% faster screening!' },
  { name: 'John', role: 'Recruiter', text: 'Ethical hiring made easy!' },
];
const faqs = [
  { q: 'Is data secure?', a: 'Encrypted end-to-end.' },
  { q: 'Custom thresholds?', a: 'Fully configurable.' },
];

// ====== Section Wrapper ======
function Section({ id, children }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });
  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };
  return (
    <motion.section
      id={id}
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={variants}
      className="py-32 px-6 md:px-16 lg:px-24 max-w-6xl mx-auto"
    >
      {children}
    </motion.section>
  );
}

// ====== Main ======
export default function Page() {
  useEffect(() => window.scrollTo(0, 0), []);
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 300], [1, 1.2]);
  const rotate = useTransform(scrollY, [0, 500], [0, 45]);
  const smoothScale = useSpring(scale, { stiffness: 30, damping: 10 });

  return (
    <div className="relative bg-black text-white overflow-x-hidden">
      {/* Parallax Background */}
      <motion.div
        style={{ scale: smoothScale, rotate }}
        className="absolute inset-0 -z-20 bg-[url('/grid.svg')] bg-[length:200px] opacity-10"
      />
      <motion.div
        style={{ scale: smoothScale }}
        className="absolute inset-0 -z-10 bg-[url('/noise.png')] bg-repeat opacity-5"
      />

      {/* Navbar */}
      <nav className="fixed w-full py-4 px-6 flex justify-between items-center bg-black/70 backdrop-blur-md z-50">
        <Link href="#hero" className="text-2xl font-bold hover:text-gray-300 transition">FairHireAI</Link>
        <div className="flex space-x-4">
          <Link href="/login" className="px-4 py-2 border border-white rounded hover:bg-white hover:text-black transition">Login</Link>
          <Link href="/signup" className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition">Sign Up</Link>
        </div>
      </nav>

      {/* Hero */}
      <Section id="hero">
        <div className="relative h-screen flex flex-col justify-center items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-6xl md:text-8xl font-black uppercase leading-tight mb-6 neon-text"
          >AI-Powered Recruitment</motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-xl md:text-2xl opacity-80 mb-12"
          >Detect Bias. Hire Fair. Scale Fast.</motion.p>
          <motion.div whileHover={{ scale: 1.1 }} className="">
            <Link href="#features" className="px-8 py-4 border-2 border-white rounded-full uppercase hover:bg-white hover:text-black transition">
              Explore Features
            </Link>
          </motion.div>
        </div>
      </Section>

      {/* Features */}
      <Section id="features">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="p-10 border border-gray-700 rounded-2xl hover:bg-white/10 transition"
            >
              <h3 className="text-2xl font-bold mb-4 neon-text">{f.title}</h3>
              <p className="opacity-75">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Methodology */}
      <Section id="methodology">
        <div className="space-y-6 text-lg opacity-80">
          <motion.p initial={{ x: -100, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
            Our pipeline removes bias proxies through dynamic filters.
          </motion.p>
          <motion.p initial={{ x: 100, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
            Models train with multi-objective fairness constraints.
          </motion.p>
          <motion.p initial={{ x: -100, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }}>
            Continuous deployment with real-time bias monitoring.
          </motion.p>
        </div>
      </Section>

      {/* Testimonials */}
      <Section id="testimonials">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: i * 0.3 }}
              className="p-10 bg-gray-900 border border-gray-700 rounded-2xl"
            >
              <p className="italic mb-4">“{t.text}”</p>
              <p className="font-semibold">— {t.name}, {t.role}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq">
        <div className="space-y-8">
          {faqs.map((q, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="p-8 border border-gray-700 rounded-xl"
            >
              <h4 className="text-xl font-semibold mb-2">{q.q}</h4>
              <p className="opacity-80">{q.a}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section id="cta">
        <motion.div initial={{ scale: 0.8 }} whileInView={{ scale: 1 }} transition={{ duration: 0.8 }} className="text-center">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6 neon-text">Ready to Transform Your Hiring?</h2>
          <Link href="/signup" className="px-12 py-6 bg-white text-black rounded-full uppercase hover:bg-gray-200 transition">
            Start Free Trial
          </Link>
        </motion.div>
      </Section>

      {/* Footer */}
      <footer className="py-16 px-6 md:px-16 bg-black/80 text-center">
        <p className="opacity-60 mb-4">© 2025 FairHireAI. All rights reserved.</p>
        <div className="space-x-6">
          <Link href="#hero" className="hover:text-white">Home</Link>
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
          <Link href="/terms" className="hover:text-white">Terms</Link>
          <Link href="/contact" className="hover:text-white">Contact</Link>
        </div>
      </footer>

      {/* Global Styles */}
      <style jsx global>{`
        html, body { margin:0; padding:0; }
        *, *::before, *::after { box-sizing: border-box; }
        .neon-text { text-shadow: 0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.6); }
      `}</style>
    </div>
  );
}
