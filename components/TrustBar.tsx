'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function TrustBar() {
  const logos = ['MBC', 'Telfaz11', 'Gulf Casting'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <section className="py-16 bg-card border-y border-border/50 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-4">
            <span className="uppercase tracking-wider text-sm text-muted-foreground">Trusted by Saudi Arabia&apos;s Leading Studios</span>
          </div>
          <div
            className="flex"
            style={{
              animation: 'scroll 30s linear infinite',
            }}
            onMouseEnter={(e) => ((e.currentTarget.style.animationPlayState = 'paused'))}
            onMouseLeave={(e) => ((e.currentTarget.style.animationPlayState = 'running'))}
          >
            {[...logos, ...logos, ...logos].map((logo, index) => (
              <div
                key={index}
                className="flex items-center justify-center min-w-[200px] h-24 mx-4 text-2xl font-semibold text-foreground/40 hover:text-foreground transition-smooth"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </motion.div>
  );
}
