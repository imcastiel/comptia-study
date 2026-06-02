import { notFound } from 'next/navigation'
import { getPublishedScenario } from '@/data/pbq-scenarios-access'
import { ScenarioPlayer } from '@/components/labs/scenario-player'

export default async function ScenarioPage({ params }: { params: Promise<{ scenarioId: string }> }) {
  const { scenarioId } = await params
  const scenario = await getPublishedScenario(scenarioId)
  if (!scenario) notFound()
  return <ScenarioPlayer scenario={scenario} />
}
