"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import Link from "next/link"
import { MagneticButton } from "./animations"

const navItems = [
  { name: "About", href: "#about" },
  { name: "Experience", href: "#experience" },
  { name: "Projects", href: "#projects" },
  { name: "Writing", href: "#writing" },
  { name: "Contact", href: "#contact" },
]

export function Navigation() {
  const [activeSection, setActiveSection] = useState("")
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        <MagneticButton>
          <Link 
            href="/" 
            className="text-xl font-medium text-foreground hover:text-primary transition-colors duration-300"
          >
            YN
          </Link>
        </MagneticButton>
        
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <MagneticButton key={item.name}>
              <Link
                href={item.href}
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`relative px-4 py-2 text-sm font-medium transition-colors duration-300
                  ${activeSection === item.name ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                {item.name}
                {hoveredItem === item.name && (
                  <motion.div
                    layoutId="nav-hover"
                    className="absolute inset-0 bg-secondary rounded-lg -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {activeSection === item.name && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                  />
                )}
              </Link>
            </MagneticButton>
          ))}
        </div>
        
        <MagneticButton>
          <a 
            href="#contact"
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Get in touch
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="transition-transform group-hover:translate-x-0.5">
              <path d="M2.5 6H9.5M9.5 6L6.5 3M9.5 6L6.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </MagneticButton>
      </div>
    </motion.nav>
  )
}
