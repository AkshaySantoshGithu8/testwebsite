"use client"

import { FadeIn, StaggerContainer, StaggerItem, MagneticButton } from "./animations"

interface Article {
  title: string
  description: string
  date: string
  readTime: string
  link: string
}

const articles: Article[] = [
  {
    title: "Building Accessible React Components",
    description: "A comprehensive guide to creating inclusive UI components that work for everyone.",
    date: "Mar 2024",
    readTime: "8 min read",
    link: "#",
  },
  {
    title: "The Art of Code Review",
    description: "Best practices for giving and receiving constructive feedback on code.",
    date: "Feb 2024",
    readTime: "6 min read",
    link: "#",
  },
  {
    title: "Performance Optimization Patterns",
    description: "Techniques for building faster web applications with React and Next.js.",
    date: "Jan 2024",
    readTime: "12 min read",
    link: "#",
  },
  {
    title: "Design Systems at Scale",
    description: "Lessons learned from building and maintaining design systems for large organizations.",
    date: "Dec 2023",
    readTime: "10 min read",
    link: "#",
  },
]

export function WritingSection() {
  return (
    <section id="writing" className="py-32 px-6 bg-card/50">
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <span className="text-primary text-sm font-medium tracking-wider uppercase mb-4 block">
            Writing
          </span>
        </FadeIn>
        
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <FadeIn delay={0.1}>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight max-w-2xl">
              Thoughts on design and code
            </h2>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <MagneticButton>
              <a
                href="#"
                className="group inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                All articles
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 16 16" 
                  fill="none" 
                  className="transition-transform group-hover:translate-x-1"
                >
                  <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </MagneticButton>
          </FadeIn>
        </div>
        
        <StaggerContainer className="space-y-1" staggerDelay={0.1}>
          {articles.map((article) => (
            <StaggerItem key={article.title}>
              <a
                href={article.link}
                className="group flex flex-col md:flex-row md:items-center gap-4 md:gap-8 p-6 rounded-xl hover:bg-card border border-transparent hover:border-border transition-all duration-300"
              >
                <div className="flex items-center gap-4 md:w-48 shrink-0">
                  <span className="text-sm text-muted-foreground">{article.date}</span>
                  <span className="text-muted-foreground/50">·</span>
                  <span className="text-sm text-muted-foreground">{article.readTime}</span>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300 flex items-center gap-2">
                    {article.title}
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 16 16" 
                      fill="none" 
                      className="opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300"
                    >
                      <path d="M4 12L12 4M12 4H6M12 4V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </h3>
                  <p className="text-muted-foreground mt-1">{article.description}</p>
                </div>
              </a>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}
