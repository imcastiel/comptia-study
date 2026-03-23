export const EXAMS = {
  CORE1: { code: '220-1201', name: 'CompTIA A+ Core 1', passingScore: 675, maxQuestions: 90, timeMinutes: 90 },
  CORE2: { code: '220-1202', name: 'CompTIA A+ Core 2', passingScore: 700, maxQuestions: 90, timeMinutes: 90 },
} as const

export const DOMAIN_WEIGHTS = {
  CORE1: { 'mobile-devices': 13, 'networking': 23, 'hardware': 25, 'virtualization-cloud': 11, 'hw-network-troubleshooting': 28 },
  CORE2: { 'operating-systems': 28, 'security': 28, 'software-troubleshooting': 23, 'operational-procedures': 21 },
} as const
