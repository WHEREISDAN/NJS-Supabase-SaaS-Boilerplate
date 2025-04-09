"use client";

import { motion, useAnimation } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";
import { ThemeToggleAdvanced } from "../ui/theme/theme-toggle";
import { useTheme } from "@/contexts/theme-provider";

export function HeroSection() {
  const { resolvedTheme } = useTheme();
  const floatAnimation = useAnimation();
  
  useEffect(() => {
    // Start a subtle floating animation for the SVG with slight rotation
    floatAnimation.start({
      y: [0, -8, 0],
      rotate: [0, 0.5, 0],
      transition: {
        duration: 8,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "mirror"
      }
    });
  }, [floatAnimation]);

  // Define colors based on theme
  const colors = {
    background: resolvedTheme === 'dark' ? '#1d232a' : '#ffffff',
    backgroundAlt: resolvedTheme === 'dark' ? '#191e24' : '#f2f2f2',
    primary: resolvedTheme === 'dark' ? '#38bdf8' : '#0ea5e9',
    primaryLight: resolvedTheme === 'dark' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(14, 165, 233, 0.2)',
    secondary: resolvedTheme === 'dark' ? '#a78bfa' : '#8b5cf6',
    accent: resolvedTheme === 'dark' ? '#f471b5' : '#ec4899',
    text: resolvedTheme === 'dark' ? '#a6adba' : '#4b5563',
    textLight: resolvedTheme === 'dark' ? 'rgba(166, 173, 186, 0.3)' : 'rgba(75, 85, 99, 0.3)',
    textLighter: resolvedTheme === 'dark' ? 'rgba(166, 173, 186, 0.1)' : 'rgba(75, 85, 99, 0.1)',
    border: resolvedTheme === 'dark' ? 'rgba(166, 173, 186, 0.2)' : 'rgba(75, 85, 99, 0.2)',
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 relative overflow-hidden">
      {/* Theme toggle in top right corner */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggleAdvanced />
      </div>
      
      {/* Subtle background pattern */}
      <div className="absolute inset-0 z-0 opacity-5">
        <motion.div 
          className="absolute top-0 left-0 w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          <div className="grid grid-cols-12 h-full">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="border-r border-base-content/10 h-full" />
            ))}
          </div>
          <div className="grid grid-rows-12 w-full absolute top-0 left-0 h-full">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="border-b border-base-content/10 w-full" />
            ))}
          </div>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 z-10 py-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left side - Text and buttons */}
          <div className="lg:w-1/2 text-left order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <motion.h1 
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-base-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                NJS SaaS Boilerplate
              </motion.h1>
              
              <motion.p 
                className="text-lg sm:text-xl md:text-2xl text-base-content/80 max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                Ship your SaaS product faster with our minimalist, production-ready Next.js starter kit.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 pt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link href="/docs">
                  <motion.button 
                    className="btn btn-primary btn-lg w-full sm:w-auto"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    See Docs
                  </motion.button>
                </Link>
                
                <Link href="/auth/signin">
                  <motion.button 
                    className="btn btn-outline btn-lg w-full sm:w-auto"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    Get Started
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Right side - Dashboard SVG with floating animation */}
          <motion.div 
            className="lg:w-1/2 flex justify-center order-1 lg:order-2 mb-8 lg:mb-0 overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.div
              animate={floatAnimation}
              className="w-full md:w-[110%] transform md:scale-100 origin-center rotate-[5deg]"
            >
              <svg
                viewBox="0 0 800 600"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto drop-shadow-xl"
              >
                {/* Dashboard frame with subtle gradient */}
                <rect
                  x="50"
                  y="50"
                  width="700"
                  height="500"
                  rx="16"
                  fill={colors.background}
                  stroke={colors.border}
                  strokeWidth="2"
                />
                
                {/* Top navigation bar */}
                <rect
                  x="50"
                  y="50"
                  width="700"
                  height="60"
                  rx="16"
                  fill={colors.backgroundAlt}
                />
                
                {/* Logo placeholder */}
                <rect
                  x="80"
                  y="70"
                  width="120"
                  height="20"
                  rx="4"
                  fill={colors.primary}
                />
                
                {/* Nav items */}
                <rect x="240" y="70" width="60" height="20" rx="4" fill={colors.textLight} />
                <rect x="320" y="70" width="60" height="20" rx="4" fill={colors.textLight} />
                <rect x="400" y="70" width="60" height="20" rx="4" fill={colors.textLight} />
                
                {/* User menu */}
                <circle cx="700" cy="80" r="20" fill={colors.textLight} />
                
                {/* Sidebar */}
                <rect
                  x="50"
                  y="110"
                  width="160"
                  height="440"
                  fill={colors.backgroundAlt}
                />
                
                {/* Sidebar menu items */}
                <rect x="70" y="150" width="120" height="16" rx="4" fill={colors.textLight} />
                <rect x="70" y="190" width="120" height="16" rx="4" fill={colors.textLight} />
                <rect x="70" y="230" width="120" height="16" rx="4" fill={colors.textLight} />
                <rect x="70" y="270" width="120" height="16" rx="4" fill={colors.textLight} />
                <rect x="70" y="310" width="120" height="16" rx="4" fill={colors.textLight} />
                
                {/* Active menu indicator */}
                <rect x="70" y="190" width="4" height="16" rx="2" fill={colors.primary} />
                
                {/* Main content area - Hero banner */}
                <rect
                  x="230"
                  y="130"
                  width="500"
                  height="100"
                  rx="8"
                  fill={colors.primaryLight}
                />
                
                {/* Banner content */}
                <rect x="250" y="150" width="200" height="24" rx="4" fill={colors.textLight} />
                <rect x="250" y="185" width="300" height="16" rx="4" fill={colors.textLighter} />
                <rect x="600" y="165" width="100" height="30" rx="4" fill={colors.primary} />
                
                {/* Stats cards */}
                <rect x="230" y="250" width="150" height="100" rx="8" fill={colors.backgroundAlt} />
                <circle cx="260" cy="280" r="15" fill={colors.secondary} opacity="0.3" />
                <rect x="290" y="270" width="70" height="16" rx="4" fill={colors.textLight} />
                <rect x="250" y="300" width="110" height="30" rx="4" fill={colors.textLighter} />
                
                <rect x="400" y="250" width="150" height="100" rx="8" fill={colors.backgroundAlt} />
                <circle cx="430" cy="280" r="15" fill={colors.primary} opacity="0.3" />
                <rect x="460" y="270" width="70" height="16" rx="4" fill={colors.textLight} />
                <rect x="420" y="300" width="110" height="30" rx="4" fill={colors.textLighter} />
                
                <rect x="570" y="250" width="150" height="100" rx="8" fill={colors.backgroundAlt} />
                <circle cx="600" cy="280" r="15" fill={colors.accent} opacity="0.3" />
                <rect x="630" y="270" width="70" height="16" rx="4" fill={colors.textLight} />
                <rect x="590" y="300" width="110" height="30" rx="4" fill={colors.textLighter} />
                
                {/* Chart area */}
                <rect
                  x="230"
                  y="370"
                  width="500"
                  height="160"
                  rx="8"
                  fill={colors.backgroundAlt}
                />
                
                {/* Chart title and legend */}
                <rect x="250" y="390" width="150" height="16" rx="4" fill={colors.textLight} />
                <rect x="600" y="390" width="40" height="16" rx="4" fill={colors.primary} opacity="0.5" />
                <rect x="650" y="390" width="40" height="16" rx="4" fill={colors.secondary} opacity="0.5" />
                
                {/* Chart grid lines */}
                <line x1="260" y1="420" x2="700" y2="420" stroke={colors.textLighter} strokeWidth="1" />
                <line x1="260" y1="450" x2="700" y2="450" stroke={colors.textLighter} strokeWidth="1" />
                <line x1="260" y1="480" x2="700" y2="480" stroke={colors.textLighter} strokeWidth="1" />
                <line x1="260" y1="510" x2="700" y2="510" stroke={colors.textLighter} strokeWidth="1" />
                
                {/* Chart lines with gradient */}
                <path
                  d="M260 480 L300 440 L340 460 L380 420 L420 430 L460 400 L500 410 L540 390 L580 420 L620 380 L660 430 L700 410"
                  stroke={colors.primary}
                  strokeWidth="3"
                  fill="none"
                />
                
                {/* Second data series */}
                <path
                  d="M260 500 L300 480 L340 490 L380 470 L420 480 L460 450 L500 470 L540 450 L580 470 L620 440 L660 460 L700 450"
                  stroke={colors.secondary}
                  strokeWidth="3"
                  fill="none"
                />
                
                {/* Chart dots for first series */}
                <circle cx="300" cy="440" r="4" fill={colors.primary} />
                <circle cx="380" cy="420" r="4" fill={colors.primary} />
                <circle cx="460" cy="400" r="4" fill={colors.primary} />
                <circle cx="540" cy="390" r="4" fill={colors.primary} />
                <circle cx="620" cy="380" r="4" fill={colors.primary} />
                <circle cx="700" cy="410" r="4" fill={colors.primary} />
                
                {/* Chart dots for second series */}
                <circle cx="300" cy="480" r="4" fill={colors.secondary} />
                <circle cx="380" cy="470" r="4" fill={colors.secondary} />
                <circle cx="460" cy="450" r="4" fill={colors.secondary} />
                <circle cx="540" cy="450" r="4" fill={colors.secondary} />
                <circle cx="620" cy="440" r="4" fill={colors.secondary} />
                <circle cx="700" cy="450" r="4" fill={colors.secondary} />
                
                {/* Chart x-axis labels */}
                <rect x="290" y="520" width="20" height="10" rx="2" fill={colors.textLighter} />
                <rect x="370" y="520" width="20" height="10" rx="2" fill={colors.textLighter} />
                <rect x="450" y="520" width="20" height="10" rx="2" fill={colors.textLighter} />
                <rect x="530" y="520" width="20" height="10" rx="2" fill={colors.textLighter} />
                <rect x="610" y="520" width="20" height="10" rx="2" fill={colors.textLighter} />
                <rect x="690" y="520" width="20" height="10" rx="2" fill={colors.textLighter} />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 