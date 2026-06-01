import { getPublishedScenarios } from '@/data/pbq-scenarios-access'
import { LabsClient } from '@/components/labs/labs-client'

export default async function LabsPage() {
  const scenarios = await getPublishedScenarios()
  return <LabsClient scenarios={scenarios} />
}
