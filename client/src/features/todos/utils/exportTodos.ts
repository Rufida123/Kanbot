import { PRIORITY_LABELS, STATUS_LABELS, TYPE_LABELS } from '@/shared/config/constants';
import { t } from '@/shared/i18n';
import type { Sprint, Todo } from '@/shared/types/api';
import { formatCount } from '@/shared/utils/formatCount';

const FORMULA_START = /^[=+\-@]/;

/**
 * One CSV cell. Quotes are doubled and the cell is wrapped when needed. Cells that start with
 * `=`, `+`, `-` or `@` get a leading `'` so a spreadsheet never runs them as a formula (CSV injection).
 */
export function escapeCsvCell(value: string | number | null | undefined): string {
  let text = value === null || value === undefined ? '' : String(value);
  if (FORMULA_START.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export const CSV_BOM = '\uFEFF';

export type ExportContext = { sprintName: (sprintId: string | null) => string };

/** UTF-8 with a BOM, so Excel opens Arabic text correctly. */
export function todosToCsv(todos: readonly Todo[], context: ExportContext): string {
  const headers = ['key', 'title', 'type', 'status', 'priority', 'points', 'labels', 'dueDate', 'sprint'].map((name) =>
    escapeCsvCell(t(`todos:export.csvHeaders.${name}`)),
  );
  const rows = todos.map((todo) =>
    [
      todo.key,
      todo.title,
      TYPE_LABELS[todo.type],
      STATUS_LABELS[todo.status],
      PRIORITY_LABELS[todo.priority],
      todo.storyPoints,
      todo.labels.join('; '),
      todo.dueDate,
      context.sprintName(todo.sprintId),
    ]
      .map(escapeCsvCell)
      .join(','),
  );
  return `${CSV_BOM}${[headers.join(','), ...rows].join('\r\n')}\r\n`;
}

/** Escapes characters that would change the structure of a Markdown table cell. */
function escapeMarkdownCell(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

export function todosToMarkdown(title: string, todos: readonly Todo[], context: ExportContext): string {
  const points = todos.reduce((sum, todo) => sum + (todo.storyPoints ?? 0), 0);
  const header = ['key', 'title', 'type', 'status', 'priority', 'points', 'dueDate'].map((name) => t(`todos:export.csvHeaders.${name}`));
  const lines = [
    `# ${escapeMarkdownCell(title)}`,
    '',
    t('todos:export.mdTotals', { todos: formatCount(todos.length, 'todo'), points: formatCount(points, 'point') }),
    '',
    `| ${header.join(' | ')} |`,
    `| ${header.map(() => '---').join(' | ')} |`,
    ...todos.map(
      (todo) =>
        `| ${[
          todo.key,
          escapeMarkdownCell(todo.title),
          TYPE_LABELS[todo.type],
          STATUS_LABELS[todo.status],
          PRIORITY_LABELS[todo.priority],
          todo.storyPoints ?? '–',
          todo.dueDate ?? '–',
        ].join(' | ')} |`,
    ),
    '',
  ];
  void context;
  return lines.join('\n');
}

/** Client-side download (Blob). Nothing leaves the browser. */
export function downloadTextFile(fileName: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export function sprintNameResolver(sprints: readonly Pick<Sprint, 'id' | 'name'>[] | undefined): ExportContext['sprintName'] {
  return (sprintId) => (sprintId === null ? t('todos:backlog') : (sprints?.find((sprint) => sprint.id === sprintId)?.name ?? ''));
}

export function safeFileName(name: string): string {
  return name.trim().replace(/[^\p{L}\p{N}_-]+/gu, '-').replace(/^-+|-+$/g, '') || 'kanbot';
}
