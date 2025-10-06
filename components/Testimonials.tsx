'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Al-Rashid",
      role: "Actress",
      quote: "TakeOne helped me land my first major role in a Saudi TV series. The platform made it so easy to find opportunities I never would have known about.",
      image: "👩‍🎭"
    },
    {
      name: "Ahmed Al-Mansouri", 
      role: "Voice Actor",
      quote: "I've been using TakeOne for 6 months and already booked 3 commercial gigs. The real-time notifications are a game-changer.",
      image: "👨‍🎤"
    },
    {
      name: "Fatima Al-Zahra",
      role: "Model & Actress",
      quote: "Finally, a platform that understands the Saudi entertainment industry. The verification process gives me confidence in every opportunity.",
      image: "👩‍💼"
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
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">What Our Talent Says</h2>
            <p className="text-lg text-muted-foreground max-w-[600px] mx-auto">
              Join thousands of successful actors, models, and performers who trust TakeOne for their careers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -4 }}
                className="h-full"
              >
                <div className="h-full bg-background border border-border rounded-lg p-8 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_8px_32px_rgba(255,68,170,0.1)]">
                  <div className="text-center mb-6">
                    <span className="text-5xl">{testimonial.image}</span>
                  </div>
                  
                  <blockquote className="text-foreground italic leading-relaxed mb-6 text-lg">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                  
                  <div className="text-center">
                    <p className="font-bold text-foreground mb-1">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
