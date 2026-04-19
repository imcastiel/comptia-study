import { notFound } from 'next/navigation'
import { PBQ_SCENARIOS } from '@/data/pbq-scenarios'
import { ScenarioPlayer } from '@/components/labs/scenario-player'

export function generateStaticParams() {
  return PBQ_SCENARIOS.map((s) => ({ scenarioId: s.id }))
}

export default async function ScenarioPage({ params }: { params: Promise<{ scenarioId: string }> }) {
  const { scenarioId } = await params
  const scenario = PBQ_SCENARIOS.find((s) => s.id === scenarioId)
  if (!scenario) notFound()
  return <ScenarioPlayer scenario={scenario} />
}
