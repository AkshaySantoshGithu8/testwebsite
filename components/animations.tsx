"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

interface ParallaxSectionProps {
  children: React.ReactNode
  className?: string
  offset?: number
}

export function ParallaxSection({ children, className = "", offset = 50 }: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })
  
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset])
  
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  )
}

interface FadeInProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right"
}

export function FadeIn({ children, className = "", delay = 0, direction = "up" }: FadeInProps) {
  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StaggerContainerProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}

export function StaggerContainer({ children, className = "", staggerDelay = 0.1 }: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function ScaleIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function TextReveal({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ")
  
  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={className}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.25em]"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.5,
                delay: i * 0.08,
                ease: [0.21, 0.47, 0.32, 0.98]
              }
            }
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  )
}

export function MagneticButton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  
  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e
    const { left, top, width, height } = ref.current!.getBoundingClientRect()
    const x = (clientX - left - width / 2) * 0.3
    const y = (clientY - top - height / 2) * 0.3
    ref.current!.style.transform = `translate(${x}px, ${y}px)`
  }
  
  const handleMouseLeave = () => {
    ref.current!.style.transform = `translate(0, 0)`
  }
  
  return (
    <div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-200 ${className}`}
    >
      {children}
    </div>
  )
}

export function CountUp({ end, duration = 2, className = "" }: { end: number; duration?: number; className?: string }) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <motion.span
        initial={{ opacity: 1 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        onViewportEnter={() => {}}
      >
        {end.toLocaleString()}+
      </motion.span>
    </motion.span>
  )
}
