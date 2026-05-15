"use client"

import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { useRef } from "react"
import { site } from "@/lib/site"

const { stats, skills } = site.about
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

export function AboutSection() {
  const containerRef = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(textRef, { once: true, margin: "-100px" })

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const imageY = useTransform(scrollYProgress, [0, 1], [50, -50])

  return (
    <section
      ref={containerRef}
      id="about"
      className="relative min-h-screen py-24 md:py-32 bg-charcoal overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-dark-brown/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 md:mb-24"
        >
          <p className="text-bronze text-sm tracking-[0.3em] uppercase mb-4">{site.about.label}</p>
          <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl text-cream">
            {site.about.heading}
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Side */}
          <motion.div
            className="relative aspect-[3/4] overflow-hidden"
            style={{ y: imageY }}
          >
            <motion.div
              className="absolute inset-0 bg-stone"
              initial={{ scaleY: 1 }}
              whileInView={{ scaleY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
              style={{ transformOrigin: "top" }}
            />
            <div className="w-full h-full bg-gradient-to-br from-stone/20 to-dark-brown flex items-center justify-center overflow-hidden">
              {site.about.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`${basePath}${site.about.photo}`}
                  alt={site.about.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <span className="font-serif text-8xl md:text-9xl text-bronze/20">{site.about.monogram}</span>
                </div>
              )}
            </div>
            
            {/* Floating Badge */}
            <motion.div
              className="absolute -right-4 md:-right-8 bottom-12 glass px-6 py-4"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <p className="text-cream font-serif text-lg">{site.about.philosophyBadgeTitle}</p>
              <p className="text-warm-beige/60 text-sm">{site.about.philosophyBadgeSubtitle}</p>
            </motion.div>
          </motion.div>

          {/* Content Side */}
          <motion.div ref={textRef} style={{ y }} className="relative z-10">
            <motion.h3
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-serif text-3xl md:text-4xl text-cream mb-6 leading-relaxed"
            >
              {site.about.name}
            </motion.h3>

            {site.about.bio.map((para, idx) => (
              <motion.p
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.3 + idx * 0.1 }}
                className={`text-warm-beige/70 text-lg leading-relaxed ${idx === site.about.bio.length - 1 ? "mb-10" : "mb-6"}`}
              >
                {para}
              </motion.p>
            ))}

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mb-12"
            >
              <p className="text-bronze text-sm tracking-[0.2em] uppercase mb-4">{site.about.expertiseLabel}</p>
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, index) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                    className="px-4 py-2 border border-stone text-warm-beige/80 text-sm tracking-wider"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="grid grid-cols-3 gap-8 pt-8 border-t border-stone/30"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                >
                  <p className="font-serif text-4xl md:text-5xl text-bronze mb-2">
                    {stat.value}
                  </p>
                  <p className="text-warm-beige/50 text-sm tracking-wider">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Philosophy Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-24 md:mt-32 text-center max-w-3xl mx-auto"
        >
          <p className="text-bronze text-sm tracking-[0.3em] uppercase mb-6">{site.about.philosophyLabel}</p>
          <blockquote className="font-serif text-2xl md:text-3xl lg:text-4xl text-cream leading-relaxed italic">
            {`"${site.about.philosophyQuote}"`}
          </blockquote>
        </motion.div>
      </div>
    </section>
  )
}
