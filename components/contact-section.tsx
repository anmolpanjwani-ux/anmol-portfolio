"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"

export function ContactSection() {
  const containerRef = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: "-100px" })
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Static-host friendly: open the user's mail client with the message pre-filled.
    // This preserves the form UX without requiring a server endpoint.
    setIsSubmitting(true)
    const subject = encodeURIComponent(`Portfolio enquiry from ${formState.name}`)
    const body = encodeURIComponent(
      `Name: ${formState.name}\nEmail: ${formState.email}\n\n${formState.message}`
    )
    if (typeof window !== "undefined") {
      window.location.href = `mailto:anmolpanjwani1635@gmail.com?subject=${subject}&body=${body}`
    }
    setTimeout(() => setIsSubmitting(false), 800)
  }

  return (
    <section
      ref={containerRef}
      id="contact"
      className="relative py-24 md:py-32 bg-dark-brown overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-stone/30 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(184,158,132,0.05)_0%,_transparent_60%)]" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16 md:mb-24 text-center"
        >
          <p className="text-bronze text-sm tracking-[0.3em] uppercase mb-4">Contact</p>
          <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl text-cream mb-6">
            {`Let's Create Together`}
          </h2>
          <p className="text-warm-beige/60 max-w-xl mx-auto leading-relaxed">
            {`Let's create spaces that tell stories. Reach out to discuss your next project.`}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="space-y-12">
              <div>
                <p className="text-bronze text-sm tracking-[0.2em] uppercase mb-4">
                  Email
                </p>
                <a
                  href="mailto:anmolpanjwani1635@gmail.com"
                  className="font-serif text-2xl md:text-3xl text-cream hover:text-bronze transition-colors"
                >
                  anmolpanjwani1635@gmail.com
                </a>
              </div>

              <div>
                <p className="text-bronze text-sm tracking-[0.2em] uppercase mb-4">
                  Phone
                </p>
                <a
                  href="tel:+917067237510"
                  className="font-serif text-2xl md:text-3xl text-cream hover:text-bronze transition-colors"
                >
                  +91 7067237510
                </a>
              </div>

              <div>
                <p className="text-bronze text-sm tracking-[0.2em] uppercase mb-4">
                  Location
                </p>
                <p className="font-serif text-2xl md:text-3xl text-cream">
                  Raipur, Chhattisgarh
                </p>
                <p className="text-warm-beige/50 mt-2">India</p>
              </div>

              {/* Social Links */}
              <div className="pt-8 border-t border-stone/20">
                <p className="text-bronze text-sm tracking-[0.2em] uppercase mb-6">
                  Connect
                </p>
                <div className="flex gap-6">
                  {["LinkedIn", "Instagram", "Behance"].map((social) => (
                    <a
                      key={social}
                      href="#"
                      className="text-warm-beige/60 hover:text-bronze text-sm tracking-wider transition-colors"
                    >
                      {social}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full bg-transparent border-b border-stone/30 py-4 text-cream placeholder-transparent focus:border-bronze focus:outline-none peer transition-colors"
                  placeholder="Your Name"
                  required
                />
                <label
                  htmlFor="name"
                  className="absolute left-0 -top-4 text-warm-beige/50 text-sm tracking-wider transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-4 peer-focus:text-sm peer-focus:text-bronze"
                >
                  Your Name
                </label>
              </div>

              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  className="w-full bg-transparent border-b border-stone/30 py-4 text-cream placeholder-transparent focus:border-bronze focus:outline-none peer transition-colors"
                  placeholder="Your Email"
                  required
                />
                <label
                  htmlFor="email"
                  className="absolute left-0 -top-4 text-warm-beige/50 text-sm tracking-wider transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-4 peer-focus:text-sm peer-focus:text-bronze"
                >
                  Your Email
                </label>
              </div>

              <div className="relative">
                <textarea
                  id="message"
                  rows={5}
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  className="w-full bg-transparent border-b border-stone/30 py-4 text-cream placeholder-transparent focus:border-bronze focus:outline-none peer transition-colors resize-none"
                  placeholder="Your Message"
                  required
                />
                <label
                  htmlFor="message"
                  className="absolute left-0 -top-4 text-warm-beige/50 text-sm tracking-wider transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-4 peer-focus:text-sm peer-focus:text-bronze"
                >
                  Tell me about your project
                </label>
              </div>

              <motion.button
                type="submit"
                className="group relative w-full py-5 bg-bronze text-charcoal font-medium tracking-wider uppercase text-sm overflow-hidden transition-all duration-500 hover:bg-cream"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10">{isSubmitting ? "Opening Mail\u2026" : "Send Message"}</span>
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
