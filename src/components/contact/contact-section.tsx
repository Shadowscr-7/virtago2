"use client"

import { motion } from "framer-motion"
import { ContactHero } from "./contact-hero"
import { ContactInfo } from "./contact-info"
import { ContactForm } from "./contact-form"
import { ContactMap } from "./contact-map"
import { ContactFAQ } from "./contact-faq"

export function ContactSection() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900">
      {/* Hero Section */}
      <ContactHero />
      
      {/* Contact Information Grid */}
      <ContactInfo />
      
      {/* Contact Form & Map Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <ContactForm />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <ContactMap />
          </motion.div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <ContactFAQ />
    </div>
  )
}
