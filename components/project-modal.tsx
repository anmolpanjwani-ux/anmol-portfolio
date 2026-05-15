"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useRef } from "react"
import { type Project } from "@/lib/projects"

interface ProjectModalProps {
  project: Project | null
  onClose: () => void
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (project) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [project, onClose])

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-charcoal/95 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal Content */}
          <motion.div
            ref={modalRef}
            className="relative w-full max-w-6xl max-h-[90vh] mx-4 bg-dark-brown overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-10 w-12 h-12 flex items-center justify-center border border-stone/50 text-cream hover:border-bronze hover:text-bronze transition-colors"
              aria-label="Close modal"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Scrollable Content */}
            <div className="overflow-y-auto max-h-[90vh]">
              {/* Hero Image */}
              <div className="relative aspect-video bg-gradient-to-br from-stone/20 to-dark-brown flex items-center justify-center overflow-hidden">
                {project.images && project.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}${project.images[0]}`}
                    alt={project.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-serif text-9xl text-bronze/10">
                    {project.title.charAt(0)}
                  </span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-brown to-transparent" />
              </div>

              {/* Content */}
              <div className="p-8 md:p-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12">
                  <div>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-bronze text-sm tracking-[0.3em] uppercase mb-3"
                    >
                      {project.category}
                    </motion.p>
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="font-serif text-4xl md:text-5xl text-cream"
                    >
                      {project.title}
                    </motion.h2>
                  </div>

                  {/* Meta Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-wrap gap-8"
                  >
                    <div>
                      <p className="text-warm-beige/50 text-xs tracking-wider uppercase mb-1">
                        Location
                      </p>
                      <p className="text-cream">{project.location}</p>
                    </div>
                    <div>
                      <p className="text-warm-beige/50 text-xs tracking-wider uppercase mb-1">
                        Year
                      </p>
                      <p className="text-cream">{project.year}</p>
                    </div>
                    <div>
                      <p className="text-warm-beige/50 text-xs tracking-wider uppercase mb-1">
                        Area
                      </p>
                      <p className="text-cream">{project.area}</p>
                    </div>
                  </motion.div>
                </div>

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="grid md:grid-cols-2 gap-12 mb-12"
                >
                  <div>
                    <h3 className="text-bronze text-sm tracking-[0.2em] uppercase mb-4">
                      Overview
                    </h3>
                    <p className="text-warm-beige/70 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-bronze text-sm tracking-[0.2em] uppercase mb-4">
                      Concept
                    </h3>
                    <p className="text-warm-beige/70 leading-relaxed">
                      {project.concept}
                    </p>
                  </div>
                </motion.div>

                {/* Style Tags */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mb-12"
                >
                  <h3 className="text-bronze text-sm tracking-[0.2em] uppercase mb-4">
                    Design Style
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {project.style.map((style) => (
                      <span
                        key={style}
                        className="px-4 py-2 border border-stone text-warm-beige/80 text-sm tracking-wider"
                      >
                        {style}
                      </span>
                    ))}
                  </div>
                </motion.div>

                {/* Gallery Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <h3 className="text-bronze text-sm tracking-[0.2em] uppercase mb-6">
                    Gallery
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {(project.images && project.images.length > 0
                      ? project.images
                      : [null, null, null, null]
                    ).map((imgPath, i) => (
                      <div
                        key={i}
                        className="aspect-[4/3] bg-gradient-to-br from-stone/10 to-dark-brown flex items-center justify-center overflow-hidden relative"
                      >
                        {imgPath ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}${imgPath}`}
                            alt={`${project.title} ${i + 1}`}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-bronze/20 font-serif text-4xl">
                            {i + 1}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
