"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Github, ExternalLink, Calendar, Clock, Target } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Project } from "@/lib/supabase/types"
import { EditableSection } from "@/components/editable-section"

interface ProjectDetailClientProps {
  project: Project
}

export function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  return (
    <EditableSection id={`project-detail-${project.slug}`} className="min-h-screen bg-background">
      <main className="min-h-screen bg-background">
        {/* Header with back button */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            href="/#projects"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Projects</span>
          </Link>
          <div className="flex items-center gap-4">
            {project.github_url && project.github_url !== "#" && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <Github className="w-4 h-4" />
                <span className="text-sm font-medium">View Code</span>
              </a>
            )}
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm font-medium">Live Demo</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {project.category && (
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
                {project.category}
              </span>
            )}
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-balance">
              {project.title}
            </h1>
            {project.role && (
              <p className="text-xl text-muted-foreground">
                {project.role} {project.year && `• ${project.year}`}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Project Image */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="px-6 mb-16"
      >
        <div className="max-w-6xl mx-auto">
          <div 
            className="aspect-video relative rounded-2xl overflow-hidden bg-secondary border border-border"
            style={{ backgroundColor: project.color ? `${project.color}20` : undefined }}
          >
            {project.image ? (
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div 
                className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10"
                style={{ backgroundColor: project.color || undefined }}
              />
            )}
          </div>
        </div>
      </motion.section>

      {/* Project Details */}
      <section className="px-6 pb-32">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">About the Project</h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {project.description}
                </p>
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-8"
            >
              {/* Project Metrics */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                {project.timeline && (
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-secondary rounded-lg">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Timeline</p>
                      <p className="font-medium text-foreground">{project.timeline}</p>
                    </div>
                  </div>
                )}
                
                {project.year && (
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-secondary rounded-lg">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Year</p>
                      <p className="font-medium text-foreground">{project.year}</p>
                    </div>
                  </div>
                )}
                
                {project.kpi && (
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-secondary rounded-lg">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Key Result</p>
                      <p className="font-medium text-foreground">{project.kpi}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Technologies */}
              {project.tools && project.tools.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-4">Technologies Used</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tools.map((tool) => (
                      <span 
                        key={tool}
                        className="px-3 py-1.5 bg-secondary text-sm rounded-lg text-muted-foreground"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  </EditableSection>
  )
}
