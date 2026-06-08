"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { EditableSection } from "@/components/editable-section"

const rotatingWords = ["build", "create", "design", "innovate"]

function RotatingWord() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % rotatingWords.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <span className="text-primary inline-block min-w-[140px]">
      <motion.span
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className="inline-block"
      >
        {rotatingWords[index]}
      </motion.span>
    </span>
  )
}

export function SectionHeader({ label }: { label: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-4 mb-12"
    >
      <span className="text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </span>
      <div className="h-px flex-1 bg-border max-w-[200px]" />
    </motion.div>
  )
}

export function AboutSection() {
  return (
    <section id="about" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeader label="About Me" />
        
        <EditableSection id="about-section">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left column - Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              I like to <RotatingWord />.
            </h2>
          </motion.div>
          
          {/* Right column - Bio */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6 text-muted-foreground text-lg leading-relaxed"
          >
            <p>
              {"Hey, Thanks for stopping by! I'm a student at [Your University] pursuing a degree in [Your Major]. I'm passionate about technology and building things that make a difference."}
            </p>
            <p>
              {"I'm originally from [Your City]. As a child I loved to build entire empires from legos. I now have a passion for building things a bit more intricate, like "}
              <a href="#projects" className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">websites & apps</a>
              {", "}
              <a href="#projects" className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">robots</a>
              {", and a "}
              <a href="#projects" className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">startup</a>
              {"."}
            </p>
            <p>
              {"I'm also interested in research, especially in Machine Learning, Large Language Models, and AI. You can find my papers "}
              <a href="#" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">here</a>
              {"."}
            </p>
            <p>
              {"In my spare time, I enjoy reading, exploring, playing sports, competitive programming, playing the guitar, and cooking."}
            </p>
          </motion.div>
        </div>
        </EditableSection>
      </div>
    </section>
  )
}
