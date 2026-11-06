/**
 * `staleTime` per query, chosen by how often the data changes (documented in client/README.md).
 * Projects change only when the user edits them, but their counters (backlog size, active
 * sprint) move with every todo and sprint action, so 30 s keeps navigation instant without
 * showing numbers that are minutes old.
 */
export const PROJECT_LIST_STALE_TIME_MS = 30_000;
export const PROJECT_DETAIL_STALE_TIME_MS = 30_000;
