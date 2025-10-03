import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, ExternalLink } from "lucide-react";

const opportunities = [
  {
    title: "Lead Role - Historical Drama Series",
    company: "MBC Studios",
    location: "Riyadh",
    deadline: "5 days left",
    type: "native",
  },
  {
    title: "Supporting Actor - Feature Film",
    company: "Rotana Pictures",
    location: "Jeddah",
    deadline: "10 days left",
    type: "native",
  },
  {
    title: "Cinematographer - Documentary",
    company: "External Production",
    location: "Al Khobar",
    deadline: "3 days left",
    type: "external",
  },
  {
    title: "Voice Over Artist - Animation",
    company: "Alamiya Studios",
    location: "Remote",
    deadline: "7 days left",
    type: "native",
  },
  {
    title: "Director of Photography",
    company: "External Agency",
    location: "Dammam",
    deadline: "12 days left",
    type: "external",
  },
  {
    title: "Lead Actress - Romantic Comedy",
    company: "Saudi Film Company",
    location: "Riyadh",
    deadline: "8 days left",
    type: "native",
  },
];

const CastingOpportunities = () => {
  return (
    <section id="opportunities" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          className="flex items-center justify-center gap-3 mb-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="w-2.5 h-2.5 rounded-full bg-secondary"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <h2 className="text-3xl md:text-4xl font-bold">
            Live Casting Opportunities
          </h2>
        </motion.div>

        <motion.p
          className="text-base text-muted-foreground text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Apply now and take your next career step
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {opportunities.map((opportunity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group relative bg-card p-4 sm:p-6 rounded-xl border-l-4 hover:shadow-xl transition-all duration-300 ${
                opportunity.type === "native"
                  ? "border-secondary hover:border-secondary/80"
                  : "border-primary hover:border-primary/80"
              }`}
            >
              <div className="flex items-start justify-between mb-3 gap-2">
                <h3 className="text-base sm:text-lg font-bold group-hover:text-foreground/80 transition-smooth line-clamp-2">
                  {opportunity.title}
                </h3>
                {opportunity.type === "external" && (
                  <ExternalLink className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                )}
              </div>

              <p className="text-sm sm:text-base font-semibold text-muted-foreground mb-3 line-clamp-1">
                {opportunity.company}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm line-clamp-1">{opportunity.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">{opportunity.deadline}</span>
                </div>
              </div>

              <Button
                variant="outline"
                className={`w-full ${
                  opportunity.type === "native"
                    ? "border-secondary text-secondary hover:bg-secondary hover:text-foreground"
                    : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                }`}
              >
                {opportunity.type === "native" ? "Apply Now" : "Learn More"}
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            View All Opportunities
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CastingOpportunities;
