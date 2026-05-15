"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useState } from "react"
import { site } from "@/lib/site"

const navItems = site.navigation.items

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-6"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.5, ease: [0.76, 0, 0.24, 1] }}
      >
        <nav className="flex items-center justify-between">
          <Link href="/" className="group">
            <motion.span 
              className="font-serif text-2xl text-cream tracking-wider"
              whileHover={{ scale: 1.05 }}
            >
              {site.navigation.brand}
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-8">
            {navItems.map((item, index) => (
              <motion.li
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.7 + index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className="relative text-sm text-warm-beige/80 hover:text-cream transition-colors duration-300 tracking-wider uppercase group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-bronze transition-all duration-300 group-hover:w-full" />
                </Link>
              </motion.li>
            ))}
          </ul>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <motion.span
              className="w-6 h-[1px] bg-cream block"
              animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 7 : 0 }}
            />
            <motion.span
              className="w-6 h-[1px] bg-cream block"
              animate={{ opacity: isOpen ? 0 : 1 }}
            />
            <motion.span
              className="w-6 h-[1px] bg-cream block"
              animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -7 : 0 }}
            />
          </button>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <motion.div
        className="fixed inset-0 z-40 bg-charcoal md:hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        style={{ pointerEvents: isOpen ? "auto" : "none" }}
      >
        <motion.ul
          className="flex flex-col items-center justify-center h-full gap-8"
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          variants={{
            open: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
            closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
          }}
        >
          {navItems.map((item) => (
            <motion.li
              key={item.name}
              variants={{
                open: { opacity: 1, y: 0 },
                closed: { opacity: 0, y: 20 },
              }}
            >
              <Link
                href={item.href}
                className="font-serif text-4xl text-cream tracking-wider"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>
    </>
  )
}
