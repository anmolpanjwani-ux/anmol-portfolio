"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef, useState } from "react"
import { projects, type Project } from "@/lib/projects"
import { ProjectModal } from "./project-modal"

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.9])

  const isEven = index % 2 === 0

  return (
    <motion.div
      ref={cardRef}
      className={`relative ${isEven ? "lg:pr-24" : "lg:pl-24 lg:ml-auto"}`}
      style={{ y: index % 2 === 0 ? y : undefined }}
    >
      <motion.article
        className="group relative cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ scale }}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, delay: index * 0.1 }}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-dark-brown mb-6">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-stone/30 to-dark-brown flex items-center justify-center"
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {project.images && project.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}${project.images[0]}`}
                alt={project.title}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <span className="font-serif text-6xl md:text-8xl text-bronze/10">{String(index + 1).padStart(2, "0")}</span>
            )}
          </motion.div>

          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-charcoal/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />

          {/* View Project Text */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="text-cream text-sm tracking-[0.3em] uppercase border border-cream/50 px-6 py-3">
              View Project
            </span>
          </motion.div>

          {/* Category Badge */}
          <div className="absolute top-6 left-6">
            <span className="text-warm-beige/60 text-xs tracking-[0.2em] uppercase">
              {project.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <motion.h3
              className="font-serif text-2xl md:text-3xl text-cream mb-2"
              animate={{ x: isHovered ? 10 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {project.title}
            </motion.h3>
            <p className="text-warm-beige/50 text-sm">{project.location}</p>
          </div>
          <p className="text-bronze text-sm tracking-wider">{project.year}</p>
        </div>

        {/* Decorative Line */}
        <motion.div
          className="absolute -bottom-4 left-0 h-[1px] bg-bronze"
          initial={{ width: 0 }}
          animate={{ width: isHovered ? "100%" : "30%" }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </motion.article>
    </motion.div>
  )
}

export function ProjectsSection() {
  const containerRef = useRef<HTMLElement>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -200])

  return (
    <>
      <section
        ref={containerRef}
        id="projects"
        className="relative py-24 md:py-32 bg-charcoal overflow-hidden"
      >
        {/* Background Pattern */}
        <motion.div
          className="absolute inset-0 opacity-5"
          style={{ y: backgroundY }}
        >
          <div className="absolute top-1/4 left-1/4 w-96 h-96 border border-bronze/20 rotate-45" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 border border-bronze/20 rotate-12" />
        </motion.div>

        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div>
              <p className="text-bronze text-sm tracking-[0.3em] uppercase mb-4">Portfolio</p>
              <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl text-cream">
                Selected Works
              </h2>
            </div>
            <p className="text-warm-beige/60 max-w-md leading-relaxed">
              A curated collection of residential and commercial interior design projects, 
              each crafted with attention to detail and a commitment to timeless aesthetics.
            </p>
          </motion.div>

          {/* Projects Grid */}
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
            {projects.map((project, index) => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
              >
                <ProjectCard project={project} index={index} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </>
  )
}
