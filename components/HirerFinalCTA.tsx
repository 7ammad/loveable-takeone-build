'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function HirerFinalCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <section className="py-20 bg-gradient-to-br from-primary via-primary to-[#E91E63]">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Ready to Find Your Perfect Cast?
          </h2>
          
          <p className="text-xl text-white/90 mb-8 max-w-[600px] mx-auto leading-relaxed">
            Join leading production companies and casting directors who are already using TakeOne to discover and connect with Saudi Arabia&apos;s most talented performers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register" className="px-8 py-4 rounded-md bg-white text-primary hover:bg-white/90 font-bold text-lg">
              Start Casting Today
            </Link>
            <Link href="#how-it-works" className="px-8 py-4 rounded-md border-2 border-white text-white hover:bg-white/10 font-bold text-lg">
              Learn More
            </Link>
          </div>
          
          <p className="text-sm text-white/70 mt-6">
            No setup fees • Free to post • Cancel anytime
          </p>
        </div>
      </section>
    </motion.div>
  );
}
