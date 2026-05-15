import type { Metadata } from 'next'
import { AdminApp } from './admin-app'

export const metadata: Metadata = {
  title: 'Admin · Anmol Panjwani',
  description: 'Portfolio admin console',
  robots: { index: false, follow: false, nocache: true },
}

export default function AdminPage() {
  return <AdminApp />
}
