/** "1 todo", "3 todos". Regular English plurals only. */
export function formatCount(count: number, singular: string): string {
  return `${count} ${count === 1 ? singular : `${singular}s`}`;
}
