import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "glass border-b border-border/50" : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <motion.div
          className="text-2xl font-bold"
          whileHover={{ scale: 1.05 }}
        >
          <span className="text-primary">Take</span>
          <span className="text-foreground">One</span>
        </motion.div>

        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#discover"
            className="text-foreground hover:text-primary transition-smooth text-shadow"
          >
            Discover Talent
          </a>
          <a
            href="#opportunities"
            className="text-foreground hover:text-secondary transition-smooth text-shadow"
          >
            Find Jobs
          </a>
          <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            Login
          </Button>
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;
