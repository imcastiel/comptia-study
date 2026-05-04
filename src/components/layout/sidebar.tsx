'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ChevronRight, BookOpen, Wifi, Cpu, Cloud, Wrench, Monitor, Shield, Bug, ClipboardList, Layers, Trophy, Terminal, X, BookMarked } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/contexts/sidebar-context'

interface Topic {
  id: string
  slug: string
  objectiveId: string
  title: string
  status: 'not_started' | 'in_progress' | 'completed' | 'needs_review'
}

interface Domain {
  id: string
  number: number
  name: string
  slug: string
  topics: Topic[]
}

interface Exam {
  id: string
  code: string
  name: string
  domains: Domain[]
}

const STATUS_DOT: Record<Topic['status'], string> = {
  not_started: 'bg-[var(--apple-label-tertiary)]',
  in_progress: 'bg-[var(--apple-blue)]',
  completed: 'bg-[var(--apple-green)]',
  needs_review: 'bg-[var(--apple-orange)]',
}

const DOMAIN_ICONS: Record<string, React.ElementType> = {
  'mobile-devices': Wifi,
  'networking': Wifi,
  'hardware': Cpu,
  'virtualization-cloud': Cloud,
  'hw-network-troubleshooting': Wrench,
  'operating-systems': Monitor,
  'security': Shield,
  'software-troubleshooting': Bug,
  'operational-procedures': ClipboardList,
}

// Static structure until database is wired up
const STATIC_EXAMS: Exam[] = [
  {
    id: 'exam-core1',
    code: '220-1201',
    name: 'Core 1',
    domains: [
      {
        id: 'd1', number: 1, name: 'Mobile Devices', slug: 'mobile-devices',
        topics: [
          { id: 't1', slug: '1-1-mobile-device-hardware', objectiveId: '1.1', title: 'Mobile Device Hardware', status: 'not_started' },
          { id: 't2', slug: '1-2-mobile-accessories-connectivity', objectiveId: '1.2', title: 'Accessories & Connectivity', status: 'not_started' },
          { id: 't3', slug: '1-3-mobile-network-connectivity', objectiveId: '1.3', title: 'Network Connectivity', status: 'not_started' },
        ],
      },
      {
        id: 'd2', number: 2, name: 'Networking', slug: 'networking',
        topics: [
          { id: 't4', slug: '2-1-tcp-udp-ports-protocols', objectiveId: '2.1', title: 'TCP/UDP Ports & Protocols', status: 'not_started' },
          { id: 't5', slug: '2-2-wireless-networking', objectiveId: '2.2', title: 'Wireless Networking', status: 'not_started' },
          { id: 't6', slug: '2-3-networked-host-services', objectiveId: '2.3', title: 'Networked Host Services', status: 'not_started' },
          { id: 't7', slug: '2-4-network-configuration', objectiveId: '2.4', title: 'Network Configuration', status: 'not_started' },
          { id: 't8', slug: '2-5-networking-hardware', objectiveId: '2.5', title: 'Networking Hardware', status: 'not_started' },
          { id: 't9', slug: '2-6-soho-networks', objectiveId: '2.6', title: 'SOHO Networks', status: 'not_started' },
          { id: 't10', slug: '2-7-internet-connection-types', objectiveId: '2.7', title: 'Internet Connection Types', status: 'not_started' },
          { id: 't11', slug: '2-8-networking-tools', objectiveId: '2.8', title: 'Networking Tools', status: 'not_started' },
        ],
      },
      {
        id: 'd3', number: 3, name: 'Hardware', slug: 'hardware',
        topics: [
          { id: 't12', slug: '3-1-display-components', objectiveId: '3.1', title: 'Display Components', status: 'not_started' },
          { id: 't13', slug: '3-2-cables-connectors', objectiveId: '3.2', title: 'Cables & Connectors', status: 'not_started' },
          { id: 't14', slug: '3-3-ram-characteristics', objectiveId: '3.3', title: 'RAM Characteristics', status: 'not_started' },
          { id: 't15', slug: '3-4-storage-devices', objectiveId: '3.4', title: 'Storage Devices', status: 'not_started' },
          { id: 't16', slug: '3-5-motherboards-cpus', objectiveId: '3.5', title: 'Motherboards & CPUs', status: 'not_started' },
          { id: 't17', slug: '3-6-power-supply', objectiveId: '3.6', title: 'Power Supply', status: 'not_started' },
          { id: 't18', slug: '3-7-printers-mfds', objectiveId: '3.7', title: 'Printers & MFDs', status: 'not_started' },
          { id: 't19', slug: '3-8-printer-maintenance', objectiveId: '3.8', title: 'Printer Maintenance', status: 'not_started' },
        ],
      },
      {
        id: 'd4', number: 4, name: 'Virtualization & Cloud', slug: 'virtualization-cloud',
        topics: [
          { id: 't20', slug: '4-1-virtualization-concepts', objectiveId: '4.1', title: 'Virtualization Concepts', status: 'not_started' },
          { id: 't21', slug: '4-2-cloud-computing', objectiveId: '4.2', title: 'Cloud Computing', status: 'not_started' },
        ],
      },
      {
        id: 'd5', number: 5, name: 'HW & Network Troubleshooting', slug: 'hw-network-troubleshooting',
        topics: [
          { id: 't22', slug: '5-1-troubleshoot-motherboard-ram-cpu-power', objectiveId: '5.1', title: 'Motherboard/RAM/CPU/Power', status: 'not_started' },
          { id: 't23', slug: '5-2-troubleshoot-storage-raid', objectiveId: '5.2', title: 'Drive & RAID Issues', status: 'not_started' },
          { id: 't24', slug: '5-3-troubleshoot-display', objectiveId: '5.3', title: 'Video & Display Issues', status: 'not_started' },
          { id: 't25', slug: '5-4-troubleshoot-mobile', objectiveId: '5.4', title: 'Mobile Device Issues', status: 'not_started' },
          { id: 't26', slug: '5-5-troubleshoot-network', objectiveId: '5.5', title: 'Network Issues', status: 'not_started' },
          { id: 't27', slug: '5-6-troubleshoot-printers', objectiveId: '5.6', title: 'Printer Issues', status: 'not_started' },
        ],
      },
    ],
  },
  {
    id: 'exam-core2',
    code: '220-1202',
    name: 'Core 2',
    domains: [
      {
        id: 'd6', number: 1, name: 'Operating Systems', slug: 'operating-systems',
        topics: [
          { id: 't28', slug: '1-1-os-types', objectiveId: '1.1', title: 'OS Types & Purposes', status: 'not_started' },
          { id: 't29', slug: '1-2-os-installations-upgrades', objectiveId: '1.2', title: 'OS Installations & Upgrades', status: 'not_started' },
          { id: 't30', slug: '1-3-windows-editions', objectiveId: '1.3', title: 'Windows Editions', status: 'not_started' },
          { id: 't31', slug: '1-4-windows-tools', objectiveId: '1.4', title: 'Windows Tools', status: 'not_started' },
          { id: 't32', slug: '1-5-windows-cli', objectiveId: '1.5', title: 'Windows CLI', status: 'not_started' },
          { id: 't33', slug: '1-6-windows-settings', objectiveId: '1.6', title: 'Windows Settings', status: 'not_started' },
          { id: 't34', slug: '1-7-windows-networking', objectiveId: '1.7', title: 'Windows Networking', status: 'not_started' },
          { id: 't35', slug: '1-8-macos-features', objectiveId: '1.8', title: 'macOS Features', status: 'not_started' },
          { id: 't36', slug: '1-9-linux-features', objectiveId: '1.9', title: 'Linux Features', status: 'not_started' },
          { id: 't37', slug: '1-10-application-installation', objectiveId: '1.10', title: 'Application Installation', status: 'not_started' },
          { id: 't38', slug: '1-11-cloud-productivity-tools', objectiveId: '1.11', title: 'Cloud Productivity Tools', status: 'not_started' },
        ],
      },
      {
        id: 'd7', number: 2, name: 'Security', slug: 'security',
        topics: [
          { id: 't39', slug: '2-1-security-measures', objectiveId: '2.1', title: 'Security Measures', status: 'not_started' },
          { id: 't40', slug: '2-2-windows-security-settings', objectiveId: '2.2', title: 'Windows Security Settings', status: 'not_started' },
          { id: 't41', slug: '2-3-wireless-security', objectiveId: '2.3', title: 'Wireless Security', status: 'not_started' },
          { id: 't42', slug: '2-4-malware', objectiveId: '2.4', title: 'Malware', status: 'not_started' },
          { id: 't43', slug: '2-5-social-engineering', objectiveId: '2.5', title: 'Social Engineering', status: 'not_started' },
          { id: 't44', slug: '2-6-malware-removal', objectiveId: '2.6', title: 'Malware Removal', status: 'not_started' },
          { id: 't45', slug: '2-7-workstation-hardening', objectiveId: '2.7', title: 'Workstation Hardening', status: 'not_started' },
          { id: 't46', slug: '2-8-mobile-security', objectiveId: '2.8', title: 'Mobile Security', status: 'not_started' },
          { id: 't47', slug: '2-9-data-destruction', objectiveId: '2.9', title: 'Data Destruction', status: 'not_started' },
          { id: 't48', slug: '2-10-soho-network-security', objectiveId: '2.10', title: 'SOHO Network Security', status: 'not_started' },
          { id: 't49', slug: '2-11-browser-security', objectiveId: '2.11', title: 'Browser Security', status: 'not_started' },
        ],
      },
      {
        id: 'd8', number: 3, name: 'Software Troubleshooting', slug: 'software-troubleshooting',
        topics: [
          { id: 't50', slug: '3-1-troubleshoot-windows', objectiveId: '3.1', title: 'Troubleshoot Windows OS', status: 'not_started' },
          { id: 't51', slug: '3-2-troubleshoot-mobile-os', objectiveId: '3.2', title: 'Troubleshoot Mobile OS', status: 'not_started' },
          { id: 't52', slug: '3-3-troubleshoot-mobile-security', objectiveId: '3.3', title: 'Mobile Security Issues', status: 'not_started' },
          { id: 't53', slug: '3-4-troubleshoot-pc-security', objectiveId: '3.4', title: 'PC Security Issues', status: 'not_started' },
        ],
      },
      {
        id: 'd9', number: 4, name: 'Operational Procedures', slug: 'operational-procedures',
        topics: [
          { id: 't54', slug: '4-1-documentation', objectiveId: '4.1', title: 'Documentation', status: 'not_started' },
          { id: 't55', slug: '4-2-change-management', objectiveId: '4.2', title: 'Change Management', status: 'not_started' },
          { id: 't56', slug: '4-3-backup-recovery', objectiveId: '4.3', title: 'Backup & Recovery', status: 'not_started' },
          { id: 't57', slug: '4-4-safety-procedures', objectiveId: '4.4', title: 'Safety Procedures', status: 'not_started' },
          { id: 't58', slug: '4-5-environmental-controls', objectiveId: '4.5', title: 'Environmental Controls', status: 'not_started' },
          { id: 't59', slug: '4-6-policies-licensing', objectiveId: '4.6', title: 'Policies & Licensing', status: 'not_started' },
          { id: 't60', slug: '4-7-professionalism', objectiveId: '4.7', title: 'Professionalism', status: 'not_started' },
          { id: 't61', slug: '4-8-scripting', objectiveId: '4.8', title: 'Scripting', status: 'not_started' },
          { id: 't62', slug: '4-9-remote-access', objectiveId: '4.9', title: 'Remote Access', status: 'not_started' },
          { id: 't63', slug: '4-10-artificial-intelligence', objectiveId: '4.10', title: 'Artificial Intelligence', status: 'not_started' },
        ],
      },
    ],
  },
]

function DomainItem({ domain, examRouteId }: { domain: Domain; examRouteId: string }) {
  const pathname = usePathname()
  const { close } = useSidebar()
  const [open, setOpen] = useState(() =>
    domain.topics.some((t) => pathname?.includes(t.slug))
  )
  const Icon = DOMAIN_ICONS[domain.slug] ?? BookOpen

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-[7px] rounded-[10px] text-[13px] font-medium text-[var(--apple-label-secondary)] hover:bg-[var(--apple-fill)] hover:text-foreground transition-colors duration-150 text-left"
      >
        <Icon className="w-3.5 h-3.5 shrink-0 opacity-60" />
        <span className="flex-1 truncate">
          {domain.number}. {domain.name}
        </span>
        <ChevronRight
          className={cn(
            'w-3 h-3 shrink-0 transition-transform duration-200',
            open && 'rotate-90'
          )}
        />
      </button>

      {open && (
        <div className="ml-[22px] mt-0.5 flex flex-col gap-px border-l border-[var(--apple-separator)] pl-3">
          {domain.topics.map((topic) => {
            const href = `/study/${examRouteId}/${domain.slug}/${topic.slug}`
            const isActive = pathname === href
            return (
              <Link
                key={topic.id}
                href={href}
                onClick={close}
                className={cn(
                  'flex items-center gap-2 px-2 py-[5px] rounded-[8px] text-[12px] transition-colors duration-150 group',
                  isActive
                    ? 'bg-[var(--apple-blue)]/10 text-[var(--apple-blue)] font-medium'
                    : 'text-[var(--apple-label-secondary)] hover:bg-[var(--apple-fill)] hover:text-foreground'
                )}
              >
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full shrink-0 transition-colors',
                    STATUS_DOT[topic.status]
                  )}
                />
                <span className="truncate">
                  <span className="opacity-60 font-mono text-[10px] mr-1">{topic.objectiveId}</span>
                  {topic.title}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SidebarContent() {
  const pathname = usePathname()
  const { close } = useSidebar()
  const defaultExam = pathname?.includes('/study/core2') ? 'exam-core2' : 'exam-core1'
  const [activeExam, setActiveExam] = useState<string>(defaultExam)

  useEffect(() => {
    setActiveExam(pathname?.includes('/study/core2') ? 'exam-core2' : 'exam-core1')
  }, [pathname])

  const NAV_LINKS = [
    { href: '/study', icon: BookOpen, label: 'Study', color: 'var(--apple-blue)' },
    { href: '/flashcards', icon: Layers, label: 'Flashcards', color: 'var(--apple-green)' },
    { href: '/practice', icon: Trophy, label: 'Practice Tests', color: 'var(--apple-orange)' },
    { href: '/labs', icon: Terminal, label: 'PBQ Labs', color: 'var(--apple-purple)' },
    { href: '/cheat-sheets', icon: BookMarked, label: 'Cheat Sheets', color: 'var(--apple-indigo)' },
  ]

  return (
    <>
      {/* Exam tabs */}
      <div className="p-2 border-b border-[var(--apple-separator)]">
        <div className="flex gap-1 bg-[var(--apple-fill)] rounded-[10px] p-0.5">
          {STATIC_EXAMS.map((exam) => (
            <button
              key={exam.id}
              onClick={() => setActiveExam(exam.id)}
              className={cn(
                'flex-1 py-1.5 text-[12px] font-medium rounded-[8px] transition-all duration-200',
                activeExam === exam.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-[var(--apple-label-secondary)] hover:text-foreground'
              )}
            >
              {exam.name}
            </button>
          ))}
        </div>
      </div>

      {/* Domain/topic tree */}
      <div className="p-2 flex flex-col gap-0.5 flex-1 overflow-y-auto">
        {STATIC_EXAMS.find((e) => e.id === activeExam)?.domains.map((domain) => {
          const exam = STATIC_EXAMS.find((e) => e.id === activeExam)!
          const examRouteId = exam.code === '220-1201' ? 'core1' : 'core2'
          return (
            <DomainItem key={domain.id} domain={domain} examRouteId={examRouteId} />
          )
        })}
      </div>

      {/* Bottom nav */}
      <div className="p-2 border-t border-[var(--apple-separator)]">
        {NAV_LINKS.map(({ href, icon: Icon, label, color }) => {
          const isActive = pathname?.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={close}
              className={cn(
                'flex items-center gap-2.5 px-3 py-[7px] rounded-[10px] text-[13px] font-medium transition-colors duration-150',
                isActive
                  ? 'text-foreground bg-[var(--apple-fill)]'
                  : 'text-[var(--apple-label-secondary)] hover:bg-[var(--apple-fill)] hover:text-foreground'
              )}
            >
              <Icon
                className="w-3.5 h-3.5 shrink-0"
                style={{ color: isActive ? color : undefined }}
              />
              {label}
            </Link>
          )
        })}
      </div>
    </>
  )
}

export function Sidebar() {
  const { isOpen, close } = useSidebar()

  return (
    <>
      {/* Desktop: always-visible fixed sidebar */}
      <aside className="hidden md:flex md:flex-col w-[260px] shrink-0 fixed left-0 top-14 bottom-0 bg-card border-r border-[var(--apple-separator)] overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Mobile: backdrop + slide-in drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          'fixed top-14 left-0 bottom-0 z-50 flex flex-col w-[280px] bg-card border-r border-[var(--apple-separator)] overflow-hidden transition-transform duration-300 md:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--apple-separator)]">
          <span className="text-[13px] font-semibold text-foreground">Menu</span>
          <button
            onClick={close}
            className="w-8 h-8 flex items-center justify-center rounded-[8px] text-[var(--apple-label-secondary)] hover:bg-[var(--apple-fill)]"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <SidebarContent />
      </aside>
    </>
  )
}
