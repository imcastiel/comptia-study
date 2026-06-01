import { getPublishedScenarios } from '@/data/pbq-scenarios-access'
import { LabsClient } from '@/components/labs/labs-client'

// Re-query per request so newly published scenarios appear without a redeploy.
export const dynamic = 'force-dynamic'

export default async function LabsPage() {
  const scenarios = await getPublishedScenarios()
  return <LabsClient scenarios={scenarios} />
}
