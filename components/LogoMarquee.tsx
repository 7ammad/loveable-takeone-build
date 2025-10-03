import { motion } from "framer-motion";

const logos = [
  "Netflix", "MBC", "Rotana", "Saudi Film", "Alamiya", "Image Nation",
  "Netflix", "MBC", "Rotana", "Saudi Film", "Alamiya", "Image Nation",
];

const LogoMarquee = () => {
  return (
    <section className="py-16 bg-noir-light">
      <div className="container mx-auto px-6">
        <motion.h2
          className="text-2xl md:text-3xl font-bold text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Trusted by Industry Leaders
        </motion.h2>

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
                  className="flex items-center justify-center min-w-[200px] h-24 text-2xl font-semibold text-foreground/60 hover:text-foreground transition-smooth"
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
