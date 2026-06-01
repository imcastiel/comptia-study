import { getPublishedCheatSheets } from '@/data/cheat-sheets-access'
import { CheatSheetsClient } from '@/components/cheat-sheets/cheat-sheets-client'

// Re-query per request so newly published cheat sheets appear without a redeploy.
export const dynamic = 'force-dynamic'

export default async function CheatSheetsPage() {
  const sheets = await getPublishedCheatSheets()
  return <CheatSheetsClient sheets={sheets} />
}
