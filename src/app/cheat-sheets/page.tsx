import { getPublishedCheatSheets } from '@/data/cheat-sheets-access'
import { CheatSheetsClient } from '@/components/cheat-sheets/cheat-sheets-client'

export default async function CheatSheetsPage() {
  const sheets = await getPublishedCheatSheets()
  return <CheatSheetsClient sheets={sheets} />
}
