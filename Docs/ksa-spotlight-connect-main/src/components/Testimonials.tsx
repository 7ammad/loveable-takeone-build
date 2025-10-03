import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "TakeOne transformed my career. Within weeks, I landed my dream role in a major production.",
    name: "Fatima Al-Qahtani",
    title: "Lead Actress",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1888",
  },
  {
    quote: "The quality of talent on this platform is exceptional. It's our go-to for every casting call.",
    name: "Khalid Al-Mutairi",
    title: "Casting Director, MBC",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1770",
  },
  {
    quote: "As a cinematographer, TakeOne connected me with visionary directors I'd never have met otherwise.",
    name: "Nora Al-Dosari",
    title: "Cinematographer",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961",
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Voices of the Community
        </motion.h2>

        <div className="space-y-32">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className={`flex flex-col ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              } items-center gap-12`}
            >
              {/* Image */}
              <div className="flex-1">
                <div className="relative aspect-square rounded-2xl overflow-hidden max-w-md mx-auto">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                </div>
              </div>

              {/* Quote */}
              <div className="flex-1 space-y-4">
                <Quote className="w-12 h-12 text-primary/30" />
                <p className="text-xl md:text-2xl font-light leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="text-xl font-bold text-primary">
                    {testimonial.name}
                  </p>
                  <p className="text-base text-muted-foreground">
                    {testimonial.title}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
