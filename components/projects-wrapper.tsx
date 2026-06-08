import { createClient } from "@/lib/supabase/server"
import { ProjectsSection } from "@/components/projects-section"
import type { Project } from "@/lib/supabase/types"

export default async function ProjectsWrapper() {
  const supabase = await createClient()
  
  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .order("order", { ascending: true })
  
  if (error) {
    console.error("Error fetching projects:", error)
  }

  return <ProjectsSection projects={(projects as Project[]) || []} />
}
