import { AdminDashboard } from '@/components/admin/analytics/admin-dashboard'

export default function AdminHomePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-[26px] font-bold tracking-tight mb-1">Dashboard</h1>
      <p className="text-[14px] text-[var(--apple-label-secondary)] mb-6">Anonymous, aggregate usage and content health.</p>
      <AdminDashboard />
    </div>
  )
}
