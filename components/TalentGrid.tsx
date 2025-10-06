import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

const talents = [
  { name: "Sarah Al-Ahmed", specialty: "Lead Actress", tag: "Acting", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face" },
  { name: "Mohammed Al-Rashid", specialty: "Director", tag: "Production", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face" },
  { name: "Layla Al-Harbi", specialty: "Cinematographer", tag: "Production", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face" },
  { name: "Ahmed Al-Saud", specialty: "Producer", tag: "Production", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face" },
  { name: "Noor Al-Faisal", specialty: "Screenwriter", tag: "Creative", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face" },
  { name: "Khalid Al-Otaibi", specialty: "Actor", tag: "Acting", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face" },
  { name: "Nora Martinez", specialty: "Art Director", tag: "Creative", image: "https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?w=400&h=400&fit=crop&crop=face" },
  { name: "Faisal Kim", specialty: "Editor", tag: "Post-Production", image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&crop=face" },
  { name: "Aisha Williams", specialty: "Sound Designer", tag: "Post-Production", image: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=400&h=400&fit=crop&crop=face" },
  { name: "Omar Mitchell", specialty: "Casting Director", tag: "Production", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face" },
];

const TalentGrid = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [visiblePanels, setVisiblePanels] = useState(5);
  const maxPosition = Math.max(0, talents.length - visiblePanels);

  useEffect(() => {
    const updateVisiblePanels = () => {
      if (window.innerWidth < 640) {
        setVisiblePanels(1);
      } else if (window.innerWidth < 1024) {
        setVisiblePanels(3);
      } else {
        setVisiblePanels(5);
      }
    };

    updateVisiblePanels();
    window.addEventListener('resize', updateVisiblePanels);
    return () => window.removeEventListener('resize', updateVisiblePanels);
  }, []);

  const scrollGallery = (direction: number) => {
    setCurrentPosition((prev) => {
      const newPos = prev + direction;
      if (newPos < 0) return 0;
      if (newPos > maxPosition) return maxPosition;
      return newPos;
    });
  };

  const visibleTalents = talents.slice(currentPosition, currentPosition + visiblePanels);

  return (
    <section id="discover" className="py-20 bg-card">
      <div className="container mx-auto px-6">
        <motion.h2
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Discover Elite Talent
        </motion.h2>
        <motion.p
          className="text-lg md:text-xl text-muted-foreground text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Find the perfect creative professionals for your next project
        </motion.p>

        {/* Gallery Container */}
        <motion.div
          className="relative w-full mx-auto max-w-[1000px]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Navigation Arrows */}
          <button
            onClick={() => scrollGallery(-1)}
            disabled={currentPosition <= 0}
            className="absolute left-0 sm:left-[-15px] lg:left-[-25px] top-1/2 -translate-y-1/2 z-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-background/70 hover:bg-background/90 border border-border flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          
          <button
            onClick={() => scrollGallery(1)}
            disabled={currentPosition >= maxPosition}
            className="absolute right-0 sm:right-[-15px] lg:right-[-25px] top-1/2 -translate-y-1/2 z-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-background/70 hover:bg-background/90 border border-border flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Gallery Wrapper */}
          <div className="overflow-hidden rounded-2xl shadow-2xl mx-4 sm:mx-8 lg:mx-0">
            <div className="flex h-[300px] sm:h-[350px] lg:h-[400px] gap-[2px] sm:gap-[3px] bg-background p-[2px] sm:p-[3px]">
              {visibleTalents.map((talent, index) => (
                <motion.div
                  key={currentPosition + index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`relative cursor-pointer border-2 border-background rounded-lg overflow-hidden flex-shrink-0 transition-all duration-500 ${
                    visiblePanels === 1
                      ? "w-full"
                      : hoveredIndex === index
                      ? "flex-[2] z-10"
                      : hoveredIndex !== null
                      ? "flex-[0.8]"
                      : "flex-1"
                  }`}
                >
                  <Image
                    src={talent.image}
                    alt={talent.name}
                    fill
                    className={`object-cover transition-transform duration-500 ${
                      hoveredIndex === index ? "scale-105" : "scale-100"
                    }`}
                  />
                  
                  {/* Content Overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent transition-transform duration-500 ${
                      hoveredIndex === index || visiblePanels === 1 ? "translate-y-0" : "translate-y-full"
                    }`}
                  >
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 lg:p-6">
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-1 sm:mb-2 line-clamp-1">{talent.name}</h3>
                      <p className="text-muted-foreground mb-1 text-xs sm:text-sm line-clamp-1">
                        {talent.specialty}
                      </p>
                      <span className="text-[10px] sm:text-xs text-gold uppercase tracking-wider">
                        {talent.tag}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            View All Talent
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default TalentGrid;
