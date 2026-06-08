"use client"

import { motion } from "framer-motion"
import { Building2 } from "lucide-react"
import { EditableSection } from "@/components/editable-section"

interface ExperienceItem {
  logo?: string
  title: string
  company: string
  companyUrl?: string
  period: string
  location: string
  description: string
}

const experiences: ExperienceItem[] = [
  {
    title: "AI Investment Research Engineer Intern",
    company: "Point72",
    period: "Summer 2025",
    location: "New York, NY",
    description: "Built systematic infra, Deep Learning Models, Risk Engine, LLM Agents, & Parallel Compute Systems"
  },
  {
    title: "Quantitative Trading Intern",
    company: "Peak6",
    period: "Nov 2024 – May 2025",
    location: "New York, NY",
    description: "Systematic trading strategies on $15MM book."
  },
  {
    title: "Machine Learning (LLM) Research Intern",
    company: "University Research Lab",
    period: "Oct 2024 – May 2025",
    location: "Philadelphia, PA",
    description: "Researching advances in NLP and LLMs, working on novel architectures for language understanding."
  },
  {
    title: "Computational Neuroscience Research Intern",
    company: "Stanford University",
    period: "Jun 2022 – May 2023",
    location: "Stanford, CA",
    description: "Parkinson's Disease Research."
  },
  {
    title: "Computational Materials Science Research Intern",
    company: "Princeton University",
    period: "2022",
    location: "Princeton, NJ",
    description: "Protein-polymer simulations & hyperspace optimization"
  },
]

function ExperienceCard({ experience, index }: { experience: ExperienceItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="relative"
    >
      {/* Timeline connector dot */}
      <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary z-10" />
      
      <div className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-colors duration-300">
        {/* Logo placeholder */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center">
            <Building2 className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>
        
        {/* Title & Company */}
        <h3 className="text-xl font-bold text-foreground text-center mb-2">
          {experience.title}
        </h3>
        <p className="text-primary text-center mb-6">
          {experience.company}
        </p>
        
        {/* Tags */}
        <div className="flex justify-center gap-3 mb-6">
          <span className="px-4 py-1.5 rounded-full border border-border text-sm text-muted-foreground">
            {experience.period}
          </span>
          <span className="px-4 py-1.5 rounded-full border border-border text-sm text-muted-foreground">
            {experience.location}
          </span>
        </div>
        
        {/* Description */}
        <p className="text-muted-foreground text-center italic">
          {experience.description}
        </p>
      </div>
    </motion.div>
  )
}

export function ExperienceSection() {
  return (
    <section id="experience" className="relative py-32 px-6">
      {/* Timeline center line */}
      <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-border" />
      
      <div className="max-w-4xl mx-auto">
        <EditableSection id="experience-section">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-foreground mb-16 text-center"
          >
            Experience
          </motion.h2>
          
          <div className="space-y-8">
          {experiences.map((exp, index) => (
            <ExperienceCard key={exp.title} experience={exp} index={index} />
          ))}
        </div>
        </EditableSection>
      </div>
    </section>
  )
}
