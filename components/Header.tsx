'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 h-16 border-b border-border/40 ${isScrolled ? 'backdrop-blur bg-background/95' : 'bg-transparent'}`}>
      <div className="container mx-auto px-6 h-full flex items-center justify-between">
        <Link href="/" className="text-2xl font-extrabold tracking-tight">
          <span className="text-foreground">Take</span>
          <span className="text-primary"> One</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/talent" className="transition-colors hover:text-primary">Discover Talent</Link>
          <Link href="/casting-calls" className="transition-colors hover:text-primary">Find Jobs</Link>
        </nav>
        
        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 text-sm border border-primary text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-colors">Login</Link>
          <Link href="/register">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/login" className="px-3 py-1.5 text-xs border border-primary text-primary rounded-md">Login</Link>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <span className="text-foreground">Take</span>
                  <span className="text-primary">One</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted"
                >
                  Home
                </Link>
                <Link
                  href="/talent"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted"
                >
                  Discover Talent
                </Link>
                <Link
                  href="/casting-calls"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted"
                >
                  Find Jobs
                </Link>
                <Link
                  href="/casters"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted"
                >
                  For Casters
                </Link>
                <div className="border-t border-border my-2" />
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    Get Started
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export const LandingHeader = () => {
  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 backdrop-blur bg-background/95 border-b border-border/40">
      <div className="container mx-auto px-6 h-full flex items-center justify-between">
        <Link href="/" className="text-2xl font-extrabold tracking-tight">
          <span className="text-foreground">Take</span>
          <span className="text-primary"> One</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link href="#discover" className="transition-colors hover:text-primary">Discover Talent</Link>
          <Link href="/casting-calls" className="transition-colors hover:text-primary">Find Jobs</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 text-sm border border-primary text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-colors">Login</Link>
        </div>
      </div>
    </header>
  );
};
