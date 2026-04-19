import type { ReactNode } from 'react'
import { ConceptCallout } from './concept-callout'
import { ComparisonTable } from './comparison-table'
import { TermTooltip } from './term-tooltip'
import { CompareCards } from './compare-cards'
import { StatCallout } from './stat-callout'
import { ProcessSteps } from './process-steps'
import { SectionHeading } from './section-heading'
import { StorageSpeedChart, OSIModel, NetworkFlow, RAIDVisual, PortReference, DisplayTechComparison } from './visual-diagram'
import { ConnectorGallery, NetworkConnectors, USBConnectors, VideoConnectors, StorageConnectors } from './connector-diagrams'

type C = { children?: ReactNode }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getMDXComponents(): Record<string, any> {
  return {
    // Headings — animated with scroll-triggered reveals
    h1: ({ children }: C) => (
      <h1 className="text-[28px] font-bold tracking-tight text-foreground mt-8 mb-4 first:mt-0">
        {children}
      </h1>
    ),
    h2: ({ children }: C) => <SectionHeading level={2}>{children}</SectionHeading>,
    h3: ({ children }: C) => <SectionHeading level={3}>{children}</SectionHeading>,
    h4: ({ children }: C) => <SectionHeading level={4}>{children}</SectionHeading>,

    // Paragraph and text
    p: ({ children }: C) => (
      <p className="text-[15px] leading-[1.75] text-foreground mb-4">
        {children}
      </p>
    ),
    strong: ({ children }: C) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    em: ({ children }: C) => (
      <em className="italic text-[var(--apple-label-secondary)]">{children}</em>
    ),

    // Lists
    ul: ({ children }: C) => (
      <ul className="mb-4 pl-5 space-y-1.5 list-none">
        {children}
      </ul>
    ),
    ol: ({ children }: C) => (
      <ol className="mb-4 pl-5 space-y-1.5 list-decimal marker:text-[var(--apple-label-tertiary)]">
        {children}
      </ol>
    ),
    li: ({ children }: C) => (
      <li className="text-[15px] leading-[1.6] text-foreground flex gap-2 items-baseline">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--apple-blue)] mt-[0.5em] shrink-0 [ol_&]:hidden" />
        <span>{children}</span>
      </li>
    ),

    // Code
    code: ({ children }: C) => (
      <code className="text-[13px] font-mono bg-[var(--apple-fill)] text-[var(--apple-blue)] px-1.5 py-0.5 rounded-[5px]">
        {children}
      </code>
    ),
    pre: ({ children }: C) => (
      <pre className="bg-[var(--apple-bg-tertiary)] dark:bg-[#1c1c1e] rounded-[14px] p-4 my-5 overflow-x-auto text-[13px] font-mono leading-[1.6] border border-[var(--apple-separator)]">
        {children}
      </pre>
    ),

    // Blockquote
    blockquote: ({ children }: C) => (
      <blockquote className="border-l-[3px] border-[var(--apple-blue)] pl-4 my-4 text-[var(--apple-label-secondary)] italic">
        {children}
      </blockquote>
    ),

    // Horizontal rule
    hr: () => (
      <hr className="my-8 border-[var(--apple-separator)]" />
    ),

    // Tables (from remark-gfm)
    table: ({ children }: C) => (
      <div className="my-5 overflow-x-auto rounded-[14px] border border-[var(--apple-separator)]">
        <table className="w-full text-[14px] border-collapse">{children}</table>
      </div>
    ),
    thead: ({ children }: C) => (
      <thead className="bg-[var(--apple-fill)] border-b border-[var(--apple-separator)]">{children}</thead>
    ),
    tbody: ({ children }: C) => <tbody>{children}</tbody>,
    tr: ({ children }: C) => (
      <tr className="border-b border-[var(--apple-separator)] last:border-0 hover:bg-[var(--apple-fill)] transition-colors">{children}</tr>
    ),
    th: ({ children }: C) => (
      <th className="px-4 py-3 text-left text-[12px] font-semibold text-[var(--apple-label-secondary)] uppercase tracking-wide">
        {children}
      </th>
    ),
    td: ({ children }: C) => (
      <td className="px-4 py-3 text-[14px] text-[var(--apple-label-secondary)] first:font-medium first:text-foreground">
        {children}
      </td>
    ),

    // Glossary tooltips — abbr elements emitted by rehype-glossary plugin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    abbr: ({ children, ...props }: C & Record<string, any>) => {
      const definition = props['data-def'] as string | undefined
      if (!definition) return <abbr {...props}>{children}</abbr>
      return <TermTooltip definition={definition}>{children}</TermTooltip>
    },

    // Custom components available in MDX
    ConceptCallout,
    ComparisonTable,
    CompareCards,
    StatCallout,
    ProcessSteps,
    StorageSpeedChart,
    OSIModel,
    NetworkFlow,
    RAIDVisual,
    PortReference,
    DisplayTechComparison,
    ConnectorGallery,
    NetworkConnectors,
    USBConnectors,
    VideoConnectors,
    StorageConnectors,
  }
}
