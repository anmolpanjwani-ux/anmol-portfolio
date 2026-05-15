import projectsData from '@/data/projects.json'

export interface Project {
  id: string
  title: string
  category: string
  location: string
  year: string
  area: string
  description: string
  concept: string
  style: string[]
  images: string[]
  featured: boolean
}

export const projects: Project[] = projectsData as Project[]
