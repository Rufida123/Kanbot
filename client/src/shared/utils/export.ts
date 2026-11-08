import type { Todo } from '@/shared/types/api';

/**
 * Export utilities for todos and sprints (CSV and Markdown).
 * All data is processed client-side; no backend needed.
 */

/**
 * Escape CSV cells: wrap in quotes and escape internal quotes.
 * Protect against formula injection by prefixing dangerous characters.
 */
function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value).trim();

  // Protect against CSV formula injection
  if (str.match(/^[=+\-@]/)) {
    return `"'${str}"`;
  }

  // Wrap and escape quotes
  if (str.includes('"') || str.includes(',') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Export todos to CSV format.
 */
export function exportTodosToCSV(todos: Todo[], fileName = 'todos.csv'): void {
  const headers = ['ID', 'Title', 'Status', 'Priority', 'Type', 'Story Points', 'Description'];
  const rows = todos.map((todo) => [
    todo.id,
    todo.title,
    todo.status,
    todo.priority,
    todo.type,
    todo.storyPoints || '',
    todo.description || '',
  ]);

  const csvContent = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ].join('\n');

  downloadFile(csvContent, fileName, 'text/csv;charset=utf-8;');
}

/**
 * Export todos to Markdown format (works well in GitHub issues, docs).
 */
export function exportTodosToMarkdown(
  todos: Todo[],
  title = 'Todos',
  fileName = 'todos.md'
): void {
  const lines = [
    `# ${title}`,
    `Generated: ${new Date().toLocaleString()}`,
    '',
    `Total: ${todos.length} todos`,
    '',
    '| Title | Status | Priority | Points |',
    '|-------|--------|----------|--------|',
    ...todos.map(
      (todo) =>
        `| ${escapeMarkdownCell(todo.title)} | ${todo.status} | ${todo.priority} | ${todo.storyPoints || '-'} |`
    ),
    '',
  ];

  // Add descriptions if they exist
  const withDescriptions = todos.filter((t) => t.description);
  if (withDescriptions.length > 0) {
    lines.push('## Details', '');
    for (const todo of withDescriptions) {
      lines.push(`### ${escapeMarkdownCell(todo.title)}`);
      lines.push(todo.description);
      lines.push('');
    }
  }

  const mdContent = lines.join('\n');
  downloadFile(mdContent, fileName, 'text/markdown;charset=utf-8;');
}

/**
 * Download a blob as a file.
 * For Arabic and complex text, uses UTF-8 with BOM for Excel compatibility.
 */
function downloadFile(content: string, fileName: string, mimeType: string): void {
  // Add UTF-8 BOM for Excel (helps with Arabic and special characters)
  const bom = '\uFEFF';
  const blob = new Blob([bom + content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escape pipes and newlines in Markdown table cells.
 */
function escapeMarkdownCell(value: string): string {
  return value
    .replace(/\|/g, '\\|')
    .replace(/\n/g, ' ')
    .trim();
}

/**
 * Format a date for export (friendly format).
 */
export function formatDateForExport(date: Date | string): string {
  if (typeof date === 'string') {
    return new Date(date).toLocaleDateString();
  }
  return date.toLocaleDateString();
}
