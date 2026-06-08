"use client"

import { motion } from "framer-motion"
import { Github, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Project } from "@/lib/supabase/types"

const sampleProjects: Project[] = [
  {
    id: "1",
    title: "Indian Recipe AI",
    slug: "medical-diagnosis-ai",
    category: "AI/ML",
    role: "Python Developer",
    year: 2025,
    color: "#3B82F6",
    image: "/projects/medical-ai.jpg",
    description: "Developed a generative AI recipe chatbot using OpenAI, React, and Firebase, generating 100+ culturally accurate Indian recipes while improving ingredient consistency and achieving sub-2-second response times.",
    tools: ["Python", "TensorFlow", "React"],
    timeline: "6 months",
    kpi: "95% accuracy rate",
    github_url: "#",
    live_url: null,
    featured: true,
    order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Intrusion Detection System",
    slug: "algorithmic-trading-platform",
    category: "Cybersecurity",
    role: "Java Developer",
    year: 2026,
    color: "#10B981",
    image: "/projects/trading.jpg",
    description: "Engineered a Java Intrusion Detection System using network traffic analysis and rule-based detection to identify potential security threats, log events, and improve system security monitoring.",
    tools: ["Java", "OOP", "TCP/IP Networking"],
    timeline: "8 months",
    kpi: "40% ROI increase",
    github_url: "#",
    live_url: null,
    featured: true,
    order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    title: "LC-3 Assembler & Simulator",
    slug: "lc3-assembler-simulator",
    category: "Systems and Hardware",
    role: "Systems Engineer",
    year: 2026,
    color: "#1b263b",
    image: "",
    description: "Built a full LC-3 assembler and simulator in C, featuring a custom microsequencer and state diagram to faithfully emulate the LC-3 ISA",
    tools: ["C", "LC-3 ISA", "Microsequencer"],
    timeline: "3 months",
    kpi: "Full ISA coverage",
    github_url: "#",
    live_url: null,
    featured: false,
    order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Space Invaders & Pac-Man",
    slug: "video-game-project",
    category: "Embedded Systems",
    role: "Game Developer",
    year: 2026,
    color: "#2d1b69",
    image: "",
    description: "Recreated classics like Space Invaders and Pac-Man from scratch, implementing original game logic, sprite rendering, and collision detection.",
    tools: ["C", "Game Logic", "Graphics"],
    timeline: "2 months",
    kpi: "2 fully playable games",
    github_url: "#",
    live_url: null,
    featured: false,
    order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "5",
    title: "Android Event Scheduler",
    slug: "android-event-scheduler",
    category: "Android Programming",
    role: "Android Developer",
    year: 2025,
    color: "#1b4d1b",
    image: "",
    description: "Developed an Android app for event scheduling with Google Calendar API integration, push notifications, and a clean Material Design UI",
    tools: ["Java", "Android", "Calendar API"],
    timeline: "4 months",
    kpi: "Full CRUD + sync",
    github_url: "#",
    live_url: null,
    featured: false,
    order: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "6",
    title: "Octave-Spaced FIR Filter Bank",
    slug: "fir-filter-bank",
    category: "DSP / Signal Processing",
    role: "Signal Processing Engineer",
    year: 2025,
    color: "#5c3000",
    image: "",
    description: "Designed and implemented a discrete-time analysis/synthesis filter bank in MATLAB that separates audio into octave-spaced frequency bands using cascaded FIR filters, downsampling, and upsampling for perfect reconstruction.",
    tools: ["MATLAB", "FIR Filters", "Wavelets"],
    timeline: "1 month",
    kpi: "Perfect reconstruction",
    github_url: "#",
    live_url: null,
    featured: false,
    order: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "7",
    title: "Coming Soon...",
    slug: "social-media-analytics",
    category: "Mystery",
    role: "Unknown",
    year: 2026,
    color: "#EC4899",
    image: "",
    description: "Please wait for me to complete this and check back!",
    tools: ["Python", "Apache Kafka", "Spark"],
    timeline: "4 months",
    kpi: "1M+ posts/day processed",
    github_url: "#",
    live_url: null,
    featured: false,
    order: 7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "8",
    title: "Coming Soon...",
    slug: "neural-style-transfer",
    category: "Mystery",
    role: "Unknown",
    year: 2026,
    color: "#14B8A6",
    image: "",
    description: "To be updated when I'm done with this endeavor.",
    tools: ["Python", "PyTorch", "FastAPI"],
    timeline: "2 months",
    kpi: "Real-time processing",
    github_url: "#",
    live_url: null,
    featured: false,
    order: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

interface ProjectsSectionProps {
  projects: Project[]
}

function FeaturedProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300"
    >
      <Link href={`/project/${project.slug}`} className="block">
        <div className="aspect-video relative bg-secondary overflow-hidden">
          {project.image ? (
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div
              className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10"
              style={{ backgroundColor: project.color || undefined }}
            />
          )}
          {project.category && (
            <span className="absolute top-4 left-4 px-3 py-1 bg-background/80 backdrop-blur-sm text-xs font-medium rounded-full">
              {project.category}
            </span>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            <div className="flex gap-2">
              {project.github_url && project.github_url !== "#" && (<a href={project.github_url} className="text-muted-foreground hover:text-primary transition-colors" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}><Github className="w-5 h-5" /></a>)}
              {project.live_url && (<a href={project.live_url} className="text-muted-foreground hover:text-primary transition-colors" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}><ExternalLink className="w-5 h-5" /></a>)}
            </div>
          </div>
          {project.role && (
            <p className="text-sm text-primary mb-2">{project.role} {project.year && `• ${project.year}`}</p>
          )}
          <div className="w-full h-px bg-border mb-3" />
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
            {project.description}
          </p>
          {project.tools && project.tools.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {project.tools.slice(0, 4).map((tool) => (
                <span key={tool} className="px-2 py-1 bg-secondary text-xs rounded-md text-muted-foreground">
                  {tool}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group relative bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300"
    >
      <Link href={`/project/${project.slug}`} className="block">
        <div className="aspect-[16/10] relative bg-secondary overflow-hidden">
          {project.image ? (
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div
              className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5"
              style={{ backgroundColor: project.color ? `${project.color}20` : undefined }}
            />
          )}
          {project.category && (
            <span className="absolute top-3 left-3 px-2 py-0.5 bg-background/80 backdrop-blur-sm text-xs font-medium rounded-full">
              {project.category}
            </span>
          )}
        </div>

        <div className="p-5">
          <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
            {project.title}
          </h3>
          {project.role && (
            <p className="text-xs text-primary mb-2">{project.role} {project.year && `• ${project.year}`}</p>
          )}
          <div className="w-full h-px bg-border mb-3" />
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
            {project.description}
          </p>
          {project.tools && project.tools.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {project.tools.slice(0, 3).map((tool) => (
                <span key={tool} className="px-2 py-0.5 bg-secondary text-xs rounded text-muted-foreground">
                  {tool}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const displayProjects = projects.length > 0 ? projects : sampleProjects

  const featuredProjects = displayProjects.filter(p => p.featured)
  const otherProjects = displayProjects.filter(p => !p.featured)

  return (
    <section id="projects" className="relative py-32 px-6">
      <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-border" />

      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-foreground mb-16"
        >
          Projects
        </motion.h2>

        {featuredProjects.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {featuredProjects.map((project, index) => (
              <FeaturedProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        )}

        {otherProjects.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}