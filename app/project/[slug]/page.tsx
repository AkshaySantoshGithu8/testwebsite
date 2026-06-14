import { createClient, hasSupabaseConfig } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import type { Project } from "@/lib/supabase/types"
import { ProjectDetailClient } from "./project-detail-client"
import type { Metadata } from "next"

// Sample projects fallback data matching the projects section
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
    description: "Built a conversational AI chatbot--ChatMasala--that generates detailed Indian vegetarian curry recipes using OpenAI's language model APIs. The system handles natural language queries about ingredients, dietary restrictions, and cooking methods, returning culturally accurate recipes with structured ingredient lists and step-by-step instructions. Integrated with React for a responsive chat UI and Firebase for session persistence, achieving sub-2-second response times across 100+ recipe interactions.",
    tools: ["Python", "OpenAI API", "React", "Firebase"],
    timeline: "6 months",
    kpi: "100+ recipes generated",
    github_url: "https://github.com/AkshaySantoshGithu8/AI-Chat-Masala",
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
    description: "Engineered a Java-based Intrusion Detection System that monitors network traffic using TCP/IP socket programming to detect anomalous behavior and potential security threats in real time. The system applies rule-based detection logic to classify incoming packets, logs flagged events with timestamps and severity levels, and generates alerts for suspicious activity patterns. Designed with object-oriented principles for modularity, making it straightforward to extend detection rules without restructuring core monitoring logic.",
    tools: ["Java", "OOP", "TCP/IP Networking", "Socket Programming"],
    timeline: "8 months",
    kpi: "Real-time threat detection",
    github_url: "https://github.com/AkshaySantoshGithu8/SimpleIntrusionDetectionSystem",
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
    category: "Systems",
    role: "Systems Engineer",
    year: 2026,
    color: "#1b263b",
    image: "",
    description: "Developed a complete LC-3 assembler and simulator in C as part of ECE 306 (Intro to Computing) at UT Austin. The assembler performs a two-pass translation of LC-3 assembly source files into machine code, resolving labels and generating binary output compatible with the LC-3 ISA. The simulator then executes that machine code, faithfully modeling the LC-3 datapath including the register file, ALU, condition codes (N/Z/P), memory-mapped I/O, and a custom microsequencer with a full state diagram governing instruction fetch, decode, and execute cycles. Labs covered I/O programming, subroutines, the stack, and interrupt-driven I/O.",
    tools: ["C", "LC-3 Assembly", "Microsequencer", "ISA Design"],
    timeline: "1 semester",
    kpi: "Full ISA coverage",
    github_url: "https://github.com/AkshaySantoshGithu8/Computer-Architecture",
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
    role: "Embedded Systems Engineer",
    year: 2026,
    color: "#2d1b69",
    image: "",
    description: "Recreated Space Invaders and Pac-Man as fully playable games on the TM4C123 microcontroller as the capstone project for ECE 319K (Embedded Systems) at UT Austin. Implemented sprite rendering to an ST7735R color LCD display over SPI, real-time collision detection, enemy AI movement patterns, score tracking, and sound output via a DAC. The game loop runs on SysTick periodic interrupts for consistent frame timing, with player input handled through edge-triggered GPIO interrupts. All graphics assets were hand-crafted as bitmapped arrays and rendered directly to the framebuffer.",
    tools: ["C", "TM4C123", "ARM Assembly", "SPI/LCD", "DAC"],
    timeline: "1 semester",
    kpi: "2 fully playable games",
    github_url: "https://github.com/AkshaySantoshGithu8/Embedded-Systems-ECE319K-",
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
    description: "Built a full-featured Android event scheduling application in Java with a custom monthly and weekly calendar view built from scratch using RecyclerView adapters (CalendarAdapter, HourAdapter). Users can create, edit, and delete events tied to specific dates and times, with data persisted locally via a SQLite database layer. The app features a daily agenda view (DailyCalendarActivity), a week view (WeekViewActivity), and an event editor (EventEditActivity) for full CRUD control. Navigation between calendar modes is handled through a clean homepage activity, with utility classes (CalendarUtils, CalendarViewHolder) abstracting date arithmetic and view binding.",
    tools: ["Java", "Android SDK", "SQLite", "RecyclerView", "Material Design"],
    timeline: "4 months",
    kpi: "Full CRUD + multi-view calendar",
    github_url: "https://github.com/AkshaySantoshGithu8/BPA-android-application-7",
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
    description: "Designed and implemented a multi-level discrete-time analysis and synthesis filter bank in MATLAB for ECE 313 (Linear Systems and Signals) at UT Austin. The system uses cascaded Cohen–Daubechies–Feauveau (bior6.8) FIR filters — a lowpass/highpass analysis pair and a corresponding synthesis pair — combined with downsampling and upsampling operations to decompose an audio signal into four octave-spaced frequency bands. Extended the two-level reference implementation to four levels at a sampling rate of 8134 Hz, enabling isolation of individual octaves from C4 to B7. Verified perfect reconstruction (error < 1e-10) and generated spectrograms for each branch. Also analyzed compression ratios and computed PSNR for each band as part of a lossy audio compression study.",
    tools: ["MATLAB", "FIR Filters", "Wavelet Transform", "Multirate DSP"],
    timeline: "1 month",
    kpi: "Perfect reconstruction verified",
    github_url: "https://github.com/AkshaySantoshGithu8/ECE313-Signals",
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

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getProject(slug: string): Promise<Project | null> {
  const sampleProject = sampleProjects.find(p => p.slug === slug)

  if (!hasSupabaseConfig()) {
    return sampleProject || null
  }

  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .single()

    if (error || !data) {
      return sampleProject || null
    }

    return data as Project
  } catch (error) {
    console.error("Unexpected error loading project:", error)
    return sampleProject || null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await getProject(slug)
  
  if (!project) {
    return {
      title: "Project Not Found",
    }
  }

  return {
    title: `${project.title} | Portfolio`,
    description: project.description || `Details about ${project.title}`,
  }
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params
  const project = await getProject(slug)

  if (!project) {
    notFound()
  }

  return <ProjectDetailClient project={project} />
}
