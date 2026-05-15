import siteData from '@/data/site.json'

export interface SiteContent {
  loading: { monogram: string; subtitle: string }
  hero: {
    subtitle: string; titleLine1: string; titleLine2Prefix: string; titleLine2Highlight: string
    description: string
    ctaPrimaryLabel: string; ctaPrimaryHref: string
    ctaSecondaryLabel: string; ctaSecondaryHref: string
    sideTextLeft: string; sideTextRight: string
  }
  navigation: { brand: string; items: { name: string; href: string }[] }
  about: {
    label: string; heading: string; name: string
    bio: string[]
    philosophyBadgeTitle: string; philosophyBadgeSubtitle: string
    expertiseLabel: string
    skills: string[]
    stats: { value: string; label: string }[]
    philosophyLabel: string; philosophyQuote: string
    photo: string; monogram: string
  }
  projectsHeader: { label: string; heading: string; description: string }
  contact: {
    label: string; heading: string; description: string
    emailLabel: string; email: string
    phoneLabel: string; phone: string
    locationLabel: string; locationLine1: string; locationLine2: string
    connectLabel: string
    socials: { label: string; href: string }[]
    formNameLabel: string; formEmailLabel: string; formMessageLabel: string; submitLabel: string
  }
  footer: { brand: string; rightsText: string; backToTopLabel: string }
}

export const site: SiteContent = siteData as SiteContent
