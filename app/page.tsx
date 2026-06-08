import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { EducationSection } from "@/components/education-section"
import { ExperienceSection } from "@/components/experience-section"
import ProjectsWrapper from "@/components/projects-wrapper"
import { ContactSection } from "@/components/contact-section"
import { MoreToComeSection } from "@/components/more-to-come"
import { Footer } from "@/components/footer"
import { SectionBackground } from "@/components/ui/section-background"
import { PageImagesOverlay } from "@/components/ui/page-images"
import { PageBackground } from "@/components/ui/page-background"

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <PageBackground />
      <PageImagesOverlay />

      {/* Vertical timeline line */}
      <div className="hidden lg:block fixed left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border to-transparent pointer-events-none z-0" />

      {/* Ambient glow that follows scroll */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none z-0" />

      <HeroSection />
      <SectionBackground sectionId="about"><AboutSection /></SectionBackground>
      <SectionBackground sectionId="education"><EducationSection /></SectionBackground>
      <SectionBackground sectionId="experience"><ExperienceSection /></SectionBackground>
      <SectionBackground sectionId="projects"><ProjectsWrapper /></SectionBackground>
      <SectionBackground sectionId="contact"><ContactSection /></SectionBackground>
      <MoreToComeSection />
      <Footer />
    </main>
  )
}