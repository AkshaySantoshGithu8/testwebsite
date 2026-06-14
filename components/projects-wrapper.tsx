import { createClient, hasSupabaseConfig } from "@/lib/supabase/server"
import { ProjectsSection } from "@/components/projects-section"
import type { Project } from "@/lib/supabase/types"

export default async function ProjectsWrapper() {
  if (!hasSupabaseConfig()) {
    console.warn("Supabase environment variables are missing; using sample project data.")
    return <ProjectsSection projects={[]} />
  }

  const supabase = await createClient()

  try {
    const { data: projects, error } = await supabase
      .from("projects")
      .select("*")
      .order("order", { ascending: true })
    
    if (error) {
      console.error("Error fetching projects:", error)
    }

    return <ProjectsSection projects={(projects as Project[]) || []} />
  } catch (error) {
    console.error("Unexpected error loading projects:", error)
    return <ProjectsSection projects={[]} />
  }
}
