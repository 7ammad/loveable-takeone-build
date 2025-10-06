import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { UserPlus, Search, Calendar } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Create Your Verified Profile",
    description: "Showcase your talent with professional portfolios, showreels, and verified credentials.",
    icon: UserPlus,
    color: "azure",
  },
  {
    number: "02",
    title: "Get Discovered by Top Hirers",
    description: "Connect with leading production companies, directors, and casting agents across Saudi Arabia.",
    icon: Search,
    color: "gold",
  },
  {
    number: "03",
    title: "Manage Auditions Seamlessly",
    description: "Track opportunities, schedule auditions, and manage your career from one elegant platform.",
    icon: Calendar,
    color: "azure",
  },
];

const ProcessSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  return (
    <section ref={containerRef} className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.h2
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          How It Works
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-start">
          {/* Left Column - Sticky Visual */}
          <div className="sticky top-24 md:top-32 md:block mb-8 md:mb-0">
            <motion.div
              className="aspect-square rounded-2xl bg-gradient-to-br from-noir-light to-background border border-primary/20 p-6 sm:p-12 relative overflow-hidden"
              style={{
                opacity: useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 1, 0.5]),
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] aspect-square border-2 border-primary/30 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[38%] aspect-square border-2 border-secondary/30 rounded-full"
                animate={{
                  scale: [1.2, 1, 1.2],
                  rotate: [360, 180, 0],
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </motion.div>
          </div>

          {/* Right Column - Steps */}
          <div className="space-y-16">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                <div className="flex items-start gap-4 sm:gap-6">
                  <div className={`p-3 sm:p-4 rounded-xl shrink-0 ${
                    step.color === "gold" 
                      ? "bg-primary/10 border border-primary/20" 
                      : "bg-secondary/10 border border-secondary/20"
                  }`}>
                    <step.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${
                      step.color === "gold" ? "text-primary" : "text-secondary"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-4xl sm:text-5xl font-bold text-muted-foreground/20 mb-2">
                      {step.number}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
