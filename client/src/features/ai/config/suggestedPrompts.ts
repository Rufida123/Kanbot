export type AssistantPage = 'backlog' | 'board' | 'sprints' | 'sprint' | 'todo' | 'other';

/** Translation keys of the prompt chips shown for each page (enhancement 17). */
export const SUGGESTED_PROMPTS: Record<AssistantPage, readonly string[]> = {
  backlog: ['ai:suggested.backlog1', 'ai:suggested.backlog2', 'ai:suggested.backlog3'],
  board: ['ai:suggested.board1', 'ai:suggested.board2', 'ai:suggested.board3'],
  sprints: ['ai:suggested.sprints1', 'ai:suggested.sprints2'],
  sprint: ['ai:suggested.sprint1', 'ai:suggested.sprint2'],
  todo: ['ai:suggested.todo1', 'ai:suggested.todo2', 'ai:suggested.todo3'],
  other: ['ai:suggested.generic1', 'ai:suggested.generic2'],
};

/** Which page the user is on: an open todo dialog (`?todo=`) wins over the page behind it. */
export function getAssistantPage(pathname: string, hasTodoOpen: boolean): AssistantPage {
  if (hasTodoOpen) return 'todo';
  if (/\/sprints\/[^/]+/.test(pathname)) return 'sprint';
  if (/\/sprints\/?$/.test(pathname)) return 'sprints';
  if (/\/board\/?$/.test(pathname)) return 'board';
  if (/\/backlog\/?$/.test(pathname)) return 'backlog';
  return 'other';
}
