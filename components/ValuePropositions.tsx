'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function ValuePropositions() {
  const propositions = [
    {
      title: "Centralized Platform",
      description: "All casting calls in one place. No more hunting through social media or waiting for word-of-mouth opportunities.",
      icon: "🎯"
    },
    {
      title: "Real-Time Updates",
      description: "Get instant notifications when new casting calls match your profile and preferences.",
      icon: "⚡"
    },
    {
      title: "Verified Opportunities",
      description: "Every casting call is verified and comes from legitimate production companies and agencies.",
      icon: "✅"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <section className="py-24 bg-card">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Why Choose TakeOne?</h2>
            <p className="text-lg text-muted-foreground max-w-[600px] mx-auto">
              We&apos;re revolutionizing how talent connects with opportunities in Saudi Arabia&apos;s entertainment industry.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {propositions.map((proposition, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -4 }}
                className="h-full"
              >
                <div className="h-full bg-background border border-border rounded-lg p-8 text-center transition-all duration-300 hover:border-primary/50 hover:shadow-[0_8px_32px_rgba(255,68,170,0.1)]">
                  <div className="text-5xl mb-4">{proposition.icon}</div>
                  <h3 className="text-2xl font-bold mb-4">{proposition.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{proposition.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
