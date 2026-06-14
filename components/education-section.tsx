"use client"

import { motion } from "framer-motion"
import { EditableSection } from "@/components/editable-section"

interface EducationItem {
  institution: string
  location: string
  graduation: string
  program: string
  degrees: string[]
  activities?: { title: string; description: string }[]
  achievements?: string[]
}

const educationData: EducationItem[] = [
  {
    institution: "Your University",
    location: "City, State",
    graduation: "Expected Graduation: May 2027",
    program: "Your Program Name",
    degrees: [
      "School of Engineering: BS, Computer Science",
      "School of Business: BS, Economics",
    ],
    activities: [
      { title: "Computer Science Club President", description: "Taught over 300 students about competitive programming, won over 40 local and national contests, and raised over $25K" },
      { title: "Robotics Club Vice President", description: "Led the Programming and Electrical team with over 50 students, designed and built 120lb robots, raised over $50K" },
      { title: "AI Club President", description: "Taught over 30 students about the fundamentals of Machine Learning, and discussed recent advances" },
    ],
  },
  {
    institution: "Your High School",
    location: "City, State",
    graduation: "",
    program: "",
    degrees: [],
    achievements: [
      "Valedictorian (Rank 1/500 students), 4.0/4.0 GPA",
      "Faculty Choice Award",
      "1590 SAT (800 Math)",
    ],
    activities: [
      { title: "Hack4Impact", description: "Technical Lead & Project Manager, leading a team of 15+ members to develop full-stack applications for local non-profits" },
      { title: "Research Club", description: "Founded and led research initiatives in Machine Learning and NLP" },
    ],
  },
]

const coursework = [
  { name: "Introduction to Electrical Engineering (ECE 302)",  ud: false },
  { name: "Introduction to Computing (ECE 306)",               ud: false },
  { name: "Introduction to Embedded Systems (ECE 319K)",       ud: false },
  { name: "Software Design and Implementation I (ECE 312)",    ud: false },
  { name: "Software Design and Implementation II (ECE 422C)",  ud: true   },
  { name: "Computer Architecture (ECE 460N)",                  ud: true   },
  { name: "Probability and Random Processes (ECE 351K)",       ud: true   },
  { name: "Linear Systems and Signals (ECE 313)",              ud: false },
  { name: "Digital Logic Design (ECE 316)",                    ud: false },
  { name: "Circuit Theory (ECE 411)",                          ud: true   },
  { name: "Computer Security Fundamentals (ECE 379K)",          ud: true   },
]

export function EducationSection() {
  return (
    <>
      {/* ── Education ───────────────────────────────────────────────── */}
      <section id="education" className="relative py-32 px-6">
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-border" />
        <div className="max-w-6xl mx-auto">
          <EditableSection id="education-heading">
            <motion.h2
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-foreground mb-16"
            >
              Education
            </motion.h2>
          </EditableSection>

          {educationData.map((edu, idx) => (
            <motion.div
              key={edu.institution}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="grid lg:grid-cols-2 gap-12 mb-20 items-start min-w-0"
            >
              <div>
                <EditableSection id={`edu-institution-${idx}`}>
                  <h3 className="text-2xl font-semibold text-primary mb-2">{edu.institution}</h3>
                </EditableSection>
                {edu.graduation && (
                  <EditableSection id={`edu-graduation-${idx}`}>
                    <p className="text-foreground mb-1">{edu.graduation}</p>
                  </EditableSection>
                )}
                <EditableSection id={`edu-location-${idx}`}>
                  <p className="text-muted-foreground">{edu.location}</p>
                </EditableSection>
              </div>

              <div className="space-y-8 min-w-0">
                {edu.program && (
                  <div className="min-w-0">
                    <EditableSection id={`edu-program-${idx}`}>
                      <h4 className="text-lg font-semibold text-foreground mb-3">{edu.program}</h4>
                    </EditableSection>
                    <ul className="space-y-2 pl-4 list-disc list-inside marker:text-primary text-muted-foreground">
                      {edu.degrees.map((degree, di) => (
                        <li key={di} className="text-sm leading-relaxed break-words">
                          <EditableSection id={`edu-degree-${idx}-${di}`} style={{ display: "contents" }}><span>{degree}</span></EditableSection>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {edu.achievements && edu.achievements.length > 0 && (
                  <ul className="space-y-2 pl-4 list-disc list-inside text-foreground font-medium">
                    {edu.achievements.map((a, ai) => (
                      <li key={ai} className="text-sm leading-relaxed break-words">
                        <EditableSection id={`edu-achievement-${idx}-${ai}`} style={{ display: "contents" }}><span>{a}</span></EditableSection>
                      </li>
                    ))}
                  </ul>
                )}

                {edu.activities && edu.activities.length > 0 && (
                  <div className="space-y-4">
                    <EditableSection id={`edu-activities-heading-${idx}`}>
                      <h4 className="text-lg font-semibold text-foreground mb-3" style={{ transform: 'translateY(-510px)' }}>Activities</h4>
                    </EditableSection>
                    <div className="space-y-4">
                      {edu.activities.map((act, ai) => (
                        <div key={ai} className="rounded-2xl border border-border/40 bg-background/70 p-4">
                          <EditableSection id={`edu-act-title-${idx}-${ai}`}>
                            <p className="text-primary font-medium text-sm leading-snug">{act.title}</p>
                          </EditableSection>
                          <EditableSection id={`edu-act-desc-${idx}-${ai}`}>
                            <p className="text-muted-foreground text-sm leading-relaxed mt-2">{act.description}</p>
                          </EditableSection>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Relevant Coursework ─────────────────────────────────────── */}
      <section id="coursework" className="relative py-24 px-6 border-t border-border/40">
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-border" />
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="flex items-center gap-4 mb-14"
          >
            <span className="text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase">Coursework</span>
            <div className="h-px flex-1 bg-border max-w-[200px]" />
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left — title + note */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <EditableSection id="coursework-title" version="2">
                <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
                  Relevant<br />Coursework
                </h2>
              </EditableSection>
              <EditableSection id="coursework-note" version="2">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  A selection of lower and upper division ECE courses.
                  <br /><br />
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-xs font-bold tracking-widest text-primary border border-primary/40 rounded-full px-2 py-0.5">UD</span>
                    <span>= upper division</span>
                  </span>
                </p>
              </EditableSection>
            </motion.div>

            {/* Right — bullet list, two columns */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}>
              <EditableSection id="edu-coursework-block" version="2">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0 divide-y divide-border/20 sm:divide-y-0">
                  {coursework.map((course, ci) => (
                    <li key={ci} className="flex items-center justify-between py-3 border-b border-border/20 gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span className="text-foreground text-sm truncate">{course.name}</span>
                      </div>
                      {course.ud && (
                        <span className="flex-shrink-0 text-[10px] font-bold tracking-widest text-primary border border-primary/40 rounded-full px-2 py-0.5">
                          UD
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </EditableSection>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}