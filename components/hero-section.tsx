"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { HeroScene } from "./hero-scene"

export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 200])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9])

  const textVariants = {
    hidden: { opacity: 0, y: 100 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 1.8 + i * 0.15,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    }),
  }

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative h-screen w-full overflow-hidden bg-charcoal"
    >
      {/* 3D Background */}
      <HeroScene />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 via-transparent to-charcoal z-10" />
      
      {/* Radial Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#1E1E1E_70%)] z-10" />

      {/* Content */}
      <motion.div
        className="relative z-20 h-full flex flex-col items-center justify-center px-6 text-center"
        style={{ y, opacity, scale }}
      >
        <div className="max-w-5xl mx-auto">
          {/* Subtitle */}
          <motion.p
            custom={0}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="text-bronze text-sm md:text-base tracking-[0.4em] uppercase mb-6"
          >
            Interior Designer
          </motion.p>

          {/* Main Title */}
          <div className="overflow-hidden mb-8">
            <motion.h1
              custom={1}
              variants={textVariants}
              initial="hidden"
              animate="visible"
              className="font-serif text-5xl md:text-7xl lg:text-8xl text-cream leading-[1.1] tracking-tight"
            >
              Designing Spaces
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-8">
            <motion.h1
              custom={2}
              variants={textVariants}
              initial="hidden"
              animate="visible"
              className="font-serif text-5xl md:text-7xl lg:text-8xl text-cream leading-[1.1] tracking-tight"
            >
              That Feel <span className="text-bronze italic">Timeless</span>
            </motion.h1>
          </div>

          {/* Description */}
          <motion.p
            custom={3}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="text-warm-beige/60 text-base md:text-lg max-w-xl mx-auto mb-12 leading-relaxed"
          >
            Spatial Storyteller | Luxury Interiors | Modern Organic Design
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            custom={4}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="#projects"
              className="group relative px-8 py-4 bg-bronze text-charcoal font-medium tracking-wider uppercase text-sm overflow-hidden transition-all duration-500 hover:bg-cream"
            >
              <span className="relative z-10">View Projects</span>
            </a>
            <a
              href="#contact"
              className="group relative px-8 py-4 border border-warm-beige/30 text-cream font-medium tracking-wider uppercase text-sm overflow-hidden transition-all duration-500 hover:border-bronze hover:text-bronze"
            >
              <span className="relative z-10">Contact</span>
            </a>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 2.5 }}
      >
        <span className="text-warm-beige/40 text-xs tracking-[0.2em] uppercase">Scroll</span>
        <motion.div
          className="w-[1px] h-12 bg-gradient-to-b from-bronze to-transparent"
          animate={{ scaleY: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Side Text */}
      <motion.div
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 hidden lg:block"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 2.2 }}
      >
        <p className="text-warm-beige/30 text-xs tracking-[0.3em] uppercase -rotate-90 origin-center whitespace-nowrap">
          Raipur, India
        </p>
      </motion.div>

      <motion.div
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 hidden lg:block"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 2.2 }}
      >
        <p className="text-warm-beige/30 text-xs tracking-[0.3em] uppercase rotate-90 origin-center whitespace-nowrap">
          Est. 2022
        </p>
      </motion.div>
    </section>
  )
}
