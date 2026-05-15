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

export const projects: Project[] = [
  {
    id: "pune-duplex",
    title: "Ganga Utopia Duplex",
    category: "Residential",
    location: "Bavdhan, Pune",
    year: "2024",
    area: "1000 sq.ft.",
    description: "A complete interior design of a duplex that successfully blended modern aesthetics with practical functionality. We used a neutral color palette with touches of wood accents to create a sophisticated yet warm environment.",
    concept: "The project involved integrating sufficient storage without overwhelming the space. Every element was carefully chosen to maintain visual balance while serving functional purposes.",
    style: ["Modern", "Minimal", "Warm"],
    images: ["/projects/pune-duplex-1.jpg", "/projects/pune-duplex-2.jpg"],
    featured: true,
  },
  {
    id: "maggies-center",
    title: "Maggie's Center",
    category: "Healthcare",
    location: "Raipur, Chhattisgarh",
    year: "2023",
    area: "571.1 m²",
    description: "A cancer support center designed to provide guidance, care, and support to patients and their families in a non-residential setting. The space offers healthcare-related services including counseling, welfare aid, diet advice, and physical health information.",
    concept: "Create a calm, restorative environment that serves as a haven for people of all ages. The design emphasizes peaceful, natural elements with abundant greenery and natural lighting.",
    style: ["Modern Organic", "Peaceful", "Healing"],
    images: ["/projects/maggies-1.jpg", "/projects/maggies-2.jpg"],
    featured: true,
  },
  {
    id: "cafe-project",
    title: "Railway Station Cafe",
    category: "Commercial",
    location: "Bhatapara",
    year: "2023",
    area: "1450 sq.ft.",
    description: "A modern café design that analyzes functional requirements combined with a refreshing perspective defined by design and materiality. Customers are encouraged to interact with the café's materials and environments.",
    concept: "We began by analyzing the functional requirements, which were then combined with our modern and refreshing perspective. The design creates an inviting atmosphere while maintaining operational efficiency.",
    style: ["Modern", "Industrial", "Inviting"],
    images: ["/projects/cafe-1.jpg", "/projects/cafe-2.jpg"],
    featured: true,
  },
  {
    id: "renovation-project",
    title: "VIP Estate Renovation",
    category: "Residential",
    location: "Shanker Nagar, Raipur",
    year: "2022",
    area: "1350 sq.ft.",
    description: "A renovation project featuring a living room with bar counter, bedroom with bathroom, office and workspace. The concept is minimal and modern with black aesthetics throughout.",
    concept: "The black veneer used behind the sofa and in bar unit adds life to this space. White polyester fabric with black piping creates a sophisticated contrast, while brushed bronze accents add warmth.",
    style: ["Minimal", "Modern", "Black Aesthetic"],
    images: ["/projects/renovation-1.jpg", "/projects/renovation-2.jpg"],
    featured: false,
  },
]
