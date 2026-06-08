"use client"

import { motion } from "framer-motion"

export function MoreToComeSection() {
  return (
    <section className="py-32 px-6 text-center">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-foreground mb-6"
        >
          More to Come
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg text-muted-foreground leading-relaxed"
        >
          {"That's it for now! This website was recently started, and is currently a work in progress. Check back here soon for more information about awards, projects, research, and more!"}
        </motion.p>
      </div>
    </section>
  )
}
