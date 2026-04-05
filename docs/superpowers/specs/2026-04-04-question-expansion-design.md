# Question Expansion Design Spec
**Date:** 2026-04-04
**Status:** Draft

---

## Goal

Expand the question bank from the current 8–14 questions per topic to **50 questions per topic** across all 63 topics (3,150 total questions, up from ~540). The question mix and difficulty distribution mirrors the real CompTIA A+ 220-1201 / 220-1202 exams.

**Single-user app — no auth scoping required.**

---

## Scope

- **In scope:** Generating new questions for all 63 topics; updating `questions.ts` to import new batches; running `npm run db:seed`
- **Out of scope:** Schema changes (existing schema already supports all needed question types); new UI; flashcard expansion; sim/performance-based questions

---

## Question Mix Per Topic (50 total)

| Type | Count | `type` field | Real exam ratio |
|------|-------|-------------|----------------|
| Single-choice MCQ | 40 | `single_choice` | ~80% |
| Multi-select MCQ | 10 | `multiple_choice` | ~20% |

Multi-select questions must specify how many answers to select in the stem (e.g., "Select TWO", "Select all that apply").

### Difficulty distribution (per topic)
| Level | Count | `difficulty` value |
|-------|-------|-------------------|
| Easy | 15 | `1` |
| Medium | 25 | `2` |
| Hard | 10 | `3` |

---

## Question Quality Standards

Each question must:
- Test a **specific, exam-relevant concept** — not trivia or edge cases not covered on the real exam
- Have **four answer choices** (A–D), with one or more correct
- Have a **clear, unambiguous stem** — no trick questions
- Include a **thorough explanation** (2–4 sentences) covering why the correct answer is right AND why common wrong answers are wrong
- Avoid repeating questions already present in the existing bank (check by concept, not just wording)
- Follow real CompTIA A+ exam question style: scenario-based where appropriate ("A technician is called to…"), straightforward factual where appropriate ("Which protocol uses port 443?")

---

## ID Convention

IDs follow the pattern: `q-<exam>-<domain>-<topic>-<nn>`

Examples:
- `q-c1-2-3-09` — Core 1, Domain 2, Topic 3, question 09
- `q-c2-1-5-12` — Core 2, Domain 1, Topic 5, question 12

New questions **continue the existing sequence** for each topic. Before generating questions for a topic, check the current highest-numbered ID in the DB:
```bash
sqlite3 comptia.db "SELECT MAX(id) FROM questions WHERE topic_id = '<topic-id>';"
```

---

## Code Pattern

All new batch files use the same helpers as existing batches:

```typescript
const NOW = new Date().toISOString()

type Choice = { id: string; text: string; isCorrect: boolean }

function ch(a: string, b: string, c: string, d: string, correct: 'a' | 'b' | 'c' | 'd'): string {
  return JSON.stringify([
    { id: 'a', text: a, isCorrect: correct === 'a' },
    { id: 'b', text: b, isCorrect: correct === 'b' },
    { id: 'c', text: c, isCorrect: correct === 'c' },
    { id: 'd', text: d, isCorrect: correct === 'd' },
  ] as Choice[])
}

function chMulti(a: string, b: string, c: string, d: string, correct: Array<'a' | 'b' | 'c' | 'd'>): string {
  const ids = new Set(correct)
  return JSON.stringify([
    { id: 'a', text: a, isCorrect: ids.has('a') },
    { id: 'b', text: b, isCorrect: ids.has('b') },
    { id: 'c', text: c, isCorrect: ids.has('c') },
    { id: 'd', text: d, isCorrect: ids.has('d') },
  ] as Choice[])
}

const ca = (id: 'a' | 'b' | 'c' | 'd') => JSON.stringify(id)
const cam = (...ids: Array<'a' | 'b' | 'c' | 'd'>) => JSON.stringify(ids)
```

Single-choice question object:
```typescript
{
  id: 'q-c1-2-3-09',
  topicId: 'topic-c1-2-3',
  type: 'single_choice',
  stem: 'Which service automatically assigns IP addresses to hosts on a network?',
  choices: ch('DNS', 'DHCP', 'NAT', 'WINS', 'b'),
  correctAnswer: ca('b'),
  explanation: 'DHCP (Dynamic Host Configuration Protocol) automatically assigns IP addresses, subnet masks, default gateways, and DNS server addresses to hosts. DNS resolves hostnames to IPs. NAT translates private IPs to public IPs. WINS resolved NetBIOS names (legacy).',
  difficulty: 1,
  tags: null,
  createdAt: NOW,
}
```

Multi-select question object:
```typescript
{
  id: 'q-c1-2-3-47',
  topicId: 'topic-c1-2-3',
  type: 'multiple_choice',
  stem: 'A technician needs to configure a DHCP server. Which TWO pieces of information are required for the scope configuration? (Select TWO)',
  choices: chMulti('IP address range', 'MAC address of the server', 'Subnet mask', 'Serial number of the router', ['a', 'c']),
  correctAnswer: cam('a', 'c'),
  explanation: 'A DHCP scope requires at minimum an IP address range (start and end) and a subnet mask to define which addresses to hand out. The server\'s MAC address and the router\'s serial number are not scope parameters.',
  difficulty: 2,
  tags: null,
  createdAt: NOW,
}
```

**Tags:** Set `tags: null` on all new questions to match existing questions in the DB.

---

## File Organization

11 new batch files (large domains are split to keep files under ~250 questions each):

| File | Domain | Topics | Net-new questions |
|------|--------|--------|------------------|
| `questions-batch8.ts` | Core 1 Domain 1 — Mobile Devices | 1-1, 1-2, 1-3 | ~126 |
| `questions-batch9.ts` | Core 1 Domain 2 — Networking | 2-1 through 2-8 | ~336 |
| `questions-batch10.ts` | Core 1 Domain 3 — Hardware | 3-1 through 3-8 | ~336 |
| `questions-batch11.ts` | Core 1 Domain 4 — Virtualization & Cloud | 4-1, 4-2 | ~84 |
| `questions-batch12.ts` | Core 1 Domain 5 — HW & Network Troubleshooting | 5-1 through 5-6 | ~252 |
| `questions-batch13a.ts` | Core 2 Domain 1 — Operating Systems (part 1) | 1-1 through 1-6 | ~252 |
| `questions-batch13b.ts` | Core 2 Domain 1 — Operating Systems (part 2) | 1-7 through 1-11 | ~210 |
| `questions-batch14a.ts` | Core 2 Domain 2 — Security (part 1) | 2-1 through 2-6 | ~252 |
| `questions-batch14b.ts` | Core 2 Domain 2 — Security (part 2) | 2-7 through 2-11 | ~210 |
| `questions-batch15.ts` | Core 2 Domain 3 — Software Troubleshooting | 3-1 through 3-4 | ~168 |
| `questions-batch16.ts` | Core 2 Domain 4 — Operational Procedures | 4-1 through 4-10 | ~420 |

**Net-new** means questions beyond what already exists in the DB. Each topic currently has 8–14 questions; batch files contain only the additional questions needed to reach 50 per topic. The sequence number for each topic's first new question is `MAX(existing_id_number) + 1` — check with:
```bash
sqlite3 comptia.db "SELECT MAX(id) FROM questions WHERE topic_id = '<topic-id>';"
```

Each file exports a named constant: `BATCH8_QUESTIONS`, `BATCH9_QUESTIONS`, `BATCH10_QUESTIONS`, `BATCH11_QUESTIONS`, `BATCH12_QUESTIONS`, `BATCH13A_QUESTIONS`, `BATCH13B_QUESTIONS`, `BATCH14A_QUESTIONS`, `BATCH14B_QUESTIONS`, `BATCH15_QUESTIONS`, `BATCH16_QUESTIONS`.

---

## Topics Reference

### Core 1

| Topic ID | Slug | Domain |
|----------|------|--------|
| topic-c1-1-1 | 1-1-mobile-device-hardware | Mobile Devices |
| topic-c1-1-2 | 1-2-mobile-accessories-connectivity | Mobile Devices |
| topic-c1-1-3 | 1-3-mobile-network-connectivity | Mobile Devices |
| topic-c1-2-1 | 2-1-tcp-udp-ports-protocols | Networking |
| topic-c1-2-2 | 2-2-wireless-networking | Networking |
| topic-c1-2-3 | 2-3-networked-host-services | Networking |
| topic-c1-2-4 | 2-4-network-configuration | Networking |
| topic-c1-2-5 | 2-5-networking-hardware | Networking |
| topic-c1-2-6 | 2-6-soho-networks | Networking |
| topic-c1-2-7 | 2-7-internet-connection-types | Networking |
| topic-c1-2-8 | 2-8-networking-tools | Networking |
| topic-c1-3-1 | 3-1-display-components | Hardware |
| topic-c1-3-2 | 3-2-cables-connectors | Hardware |
| topic-c1-3-3 | 3-3-ram-characteristics | Hardware |
| topic-c1-3-4 | 3-4-storage-devices | Hardware |
| topic-c1-3-5 | 3-5-motherboards-cpus | Hardware |
| topic-c1-3-6 | 3-6-power-supply | Hardware |
| topic-c1-3-7 | 3-7-printers-mfds | Hardware |
| topic-c1-3-8 | 3-8-printer-maintenance | Hardware |
| topic-c1-4-1 | 4-1-virtualization-concepts | Virtualization & Cloud |
| topic-c1-4-2 | 4-2-cloud-computing | Virtualization & Cloud |
| topic-c1-5-1 | 5-1-troubleshoot-motherboard-ram-cpu-power | HW & Network Troubleshooting |
| topic-c1-5-2 | 5-2-troubleshoot-storage-raid | HW & Network Troubleshooting |
| topic-c1-5-3 | 5-3-troubleshoot-display | HW & Network Troubleshooting |
| topic-c1-5-4 | 5-4-troubleshoot-mobile | HW & Network Troubleshooting |
| topic-c1-5-5 | 5-5-troubleshoot-network | HW & Network Troubleshooting |
| topic-c1-5-6 | 5-6-troubleshoot-printers | HW & Network Troubleshooting |

### Core 2

| Topic ID | Slug | Domain |
|----------|------|--------|
| topic-c2-1-1 | 1-1-os-types | Operating Systems |
| topic-c2-1-2 | 1-2-os-installations-upgrades | Operating Systems |
| topic-c2-1-3 | 1-3-windows-editions | Operating Systems |
| topic-c2-1-4 | 1-4-windows-tools | Operating Systems |
| topic-c2-1-5 | 1-5-windows-cli | Operating Systems |
| topic-c2-1-6 | 1-6-windows-settings | Operating Systems |
| topic-c2-1-7 | 1-7-windows-networking | Operating Systems |
| topic-c2-1-8 | 1-8-macos-features | Operating Systems |
| topic-c2-1-9 | 1-9-linux-features | Operating Systems |
| topic-c2-1-10 | 1-10-application-installation | Operating Systems |
| topic-c2-1-11 | 1-11-cloud-productivity-tools | Operating Systems |
| topic-c2-2-1 | 2-1-security-measures | Security |
| topic-c2-2-2 | 2-2-windows-security-settings | Security |
| topic-c2-2-3 | 2-3-wireless-security | Security |
| topic-c2-2-4 | 2-4-malware | Security |
| topic-c2-2-5 | 2-5-social-engineering | Security |
| topic-c2-2-6 | 2-6-malware-removal | Security |
| topic-c2-2-7 | 2-7-workstation-hardening | Security |
| topic-c2-2-8 | 2-8-mobile-security | Security |
| topic-c2-2-9 | 2-9-data-destruction | Security |
| topic-c2-2-10 | 2-10-soho-network-security | Security |
| topic-c2-2-11 | 2-11-browser-security | Security |
| topic-c2-3-1 | 3-1-troubleshoot-windows | Software Troubleshooting |
| topic-c2-3-2 | 3-2-troubleshoot-mobile-os | Software Troubleshooting |
| topic-c2-3-3 | 3-3-troubleshoot-mobile-security | Software Troubleshooting |
| topic-c2-3-4 | 3-4-troubleshoot-pc-security | Software Troubleshooting |
| topic-c2-4-1 | 4-1-documentation | Operational Procedures |
| topic-c2-4-2 | 4-2-change-management | Operational Procedures |
| topic-c2-4-3 | 4-3-backup-recovery | Operational Procedures |
| topic-c2-4-4 | 4-4-safety-procedures | Operational Procedures |
| topic-c2-4-5 | 4-5-environmental-controls | Operational Procedures |
| topic-c2-4-6 | 4-6-policies-licensing | Operational Procedures |
| topic-c2-4-7 | 4-7-professionalism | Operational Procedures |
| topic-c2-4-8 | 4-8-scripting | Operational Procedures |
| topic-c2-4-9 | 4-9-remote-access | Operational Procedures |
| topic-c2-4-10 | 4-10-artificial-intelligence | Operational Procedures |

---

## Wiring: `questions.ts` Update

Add imports for all 11 new batches and spread them into the existing `SEED_QUESTIONS` export:

```typescript
import { BATCH8_QUESTIONS } from './questions-batch8'
import { BATCH9_QUESTIONS } from './questions-batch9'
import { BATCH10_QUESTIONS } from './questions-batch10'
import { BATCH11_QUESTIONS } from './questions-batch11'
import { BATCH12_QUESTIONS } from './questions-batch12'
import { BATCH13A_QUESTIONS } from './questions-batch13a'
import { BATCH13B_QUESTIONS } from './questions-batch13b'
import { BATCH14A_QUESTIONS } from './questions-batch14a'
import { BATCH14B_QUESTIONS } from './questions-batch14b'
import { BATCH15_QUESTIONS } from './questions-batch15'
import { BATCH16_QUESTIONS } from './questions-batch16'

export const SEED_QUESTIONS = [
  // Existing batches — keep all existing imports (BATCH1 through BATCH7) and spreads
  ...BATCH1_QUESTIONS,
  ...BATCH2_QUESTIONS,
  ...BATCH3_QUESTIONS,
  ...BATCH4_QUESTIONS,
  ...BATCH5_QUESTIONS,
  ...BATCH6_QUESTIONS,
  ...BATCH7_QUESTIONS,
  // New batches — append after existing
  ...BATCH8_QUESTIONS,
  ...BATCH9_QUESTIONS,
  ...BATCH10_QUESTIONS,
  ...BATCH11_QUESTIONS,
  ...BATCH12_QUESTIONS,
  ...BATCH13A_QUESTIONS,
  ...BATCH13B_QUESTIONS,
  ...BATCH14A_QUESTIONS,
  ...BATCH14B_QUESTIONS,
  ...BATCH15_QUESTIONS,
  ...BATCH16_QUESTIONS,
]
```

The export name `SEED_QUESTIONS` must be preserved — `src/db/seed/index.ts` imports it by this name.

---

## Seeding

After all batch files are created and `questions.ts` is updated:

```bash
npm run db:seed
```

The seed script is non-destructive for questions — it uses `INSERT OR IGNORE`, so re-running will not duplicate existing questions.

---

## Out of Scope

- Flashcard expansion (separate effort)
- Performance-based / sim questions (separate effort)
- Question editing UI
- Question difficulty auto-calibration from user performance
