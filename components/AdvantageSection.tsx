import { motion } from "framer-motion";
import { useState } from "react";
import { Shield, Zap, Users, TrendingUp, Award, Briefcase } from "lucide-react";

const features = {
  talent: [
    {
      icon: Shield,
      title: "Verified Profiles",
      description: "Build trust with verified credentials and professional portfolios",
    },
    {
      icon: Zap,
      title: "Instant Notifications",
      description: "Never miss an opportunity with real-time casting alerts",
    },
    {
      icon: TrendingUp,
      title: "Career Growth",
      description: "Track your progress and unlock new opportunities as you grow",
    },
  ],
  hirers: [
    {
      icon: Users,
      title: "Curated Talent Pool",
      description: "Access pre-vetted, professional creatives ready to work",
    },
    {
      icon: Award,
      title: "Quality Assured",
      description: "Review portfolios, ratings, and previous work history",
    },
    {
      icon: Briefcase,
      title: "Streamlined Hiring",
      description: "Manage casting calls and auditions from one platform",
    },
  ],
};

const AdvantageSection = () => {
  const [activeTab, setActiveTab] = useState<"talent" | "hirers">("talent");

  return (
    <section className="py-24 bg-card">
      <div className="container mx-auto px-6">
        <motion.h2
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          The TakeOne Advantage
        </motion.h2>

        {/* Tabs */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex bg-card rounded-lg p-1">
            <button
              onClick={() => setActiveTab("talent")}
              className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === "talent"
                  ? "bg-background text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              For Talent
            </button>
            <button
              onClick={() => setActiveTab("hirers")}
              className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === "hirers"
                  ? "bg-background text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              For Hirers
            </button>
          </div>
        </div>

        {/* Features */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {features[activeTab].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-card p-8 rounded-xl border border-border hover:border-primary/50 transition-all duration-300"
            >
              <div className="mb-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AdvantageSection;
