import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

const FinalCTA = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section ref={containerRef} className="relative py-20 overflow-hidden">
      {/* Parallax Background */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background z-10" />
        <img
          src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=2070"
          alt="Creative Scene"
          className="w-full h-full object-cover opacity-30"
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-6 text-center">
        <motion.h2
          className="text-4xl md:text-5xl font-bold mb-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          Your Next Opportunity <br />
          <span className="text-primary">Awaits</span>
        </motion.h2>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Join Saudi Arabia's premier platform for creative talent and hirers
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-4 rounded-lg"
          >
            Create My Profile
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-secondary text-secondary hover:bg-secondary hover:text-foreground px-10 py-4 rounded-lg"
          >
            Find Top Talent
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
