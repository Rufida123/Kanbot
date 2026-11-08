import { t } from '@/shared/i18n';

export type CountUnit = 'todo' | 'matchingTodo' | 'unfinishedTodo' | 'point' | 'day' | 'label';

/** "1 todo", "3 todos", Arabic: "مهمتان". Plural rules come from i18next (`common:count.*`). */
export function formatCount(count: number, unit: CountUnit): string {
  return t(`common:count.${unit}`, { count });
}
