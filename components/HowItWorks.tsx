'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Create Your Profile",
      description: "Set up your talent profile with photos, reels, and experience details."
    },
    {
      number: "02", 
      title: "Browse Opportunities",
      description: "Explore verified casting calls from top production companies across Saudi Arabia."
    },
    {
      number: "03",
      title: "Apply & Connect",
      description: "Submit your application directly through our platform and connect with casting directors."
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-[600px] mx-auto">
              Get started in three simple steps and begin your journey to your next big role.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                  {step.number}
                </div>
                
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>

                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-border -z-10" style={{ transform: 'translateX(50%)' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
