import { motion } from "framer-motion";

const logos = [
  "Netflix", "MBC", "Rotana", "Saudi Film", "Alamiya", "Image Nation",
  "Netflix", "MBC", "Rotana", "Saudi Film", "Alamiya", "Image Nation",
];

const LogoMarquee = () => {
  return (
    <section className="py-16 bg-card border-y border-border/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-6">
          <span className="uppercase tracking-wider text-sm text-muted-foreground">TRUSTED BY INDUSTRY LEADERS</span>
        </div>

        <div className="relative overflow-hidden">
          <div className="flex">
            <motion.div
              className="flex gap-16 pr-16"
              animate={{
                x: [0, -50 + "%"],
              }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {logos.map((logo, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center min-w-[200px] h-24 text-2xl font-semibold text-foreground/40 hover:text-foreground transition-smooth"
                >
                  {logo}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LogoMarquee;
