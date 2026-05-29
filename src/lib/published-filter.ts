export function onlyPublished<T extends { published: boolean }>(rows: T[]): T[] {
  return rows.filter((r) => r.published)
}
