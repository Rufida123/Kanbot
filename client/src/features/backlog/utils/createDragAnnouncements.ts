import type { Announcements } from '@dnd-kit/core';

export const SCREEN_READER_INSTRUCTIONS =
  'To pick up a todo, press Space or Enter on its reorder button. Use the arrow keys to move it within a list or into another list. Press Space or Enter to drop it, or Escape to cancel.';

export type Placement = { listLabel: string; position: number; total: number };

type AnnouncementSource = {
  getKey: (todoId: string) => string;
  /** Where an item or list currently is, `null` when unknown. */
  describe: (id: string) => Placement | null;
};

function formatPlacement({ listLabel, position, total }: Placement): string {
  if (total === 0) return `${listLabel}, empty list`;
  return `${listLabel}, position ${position} of ${total}`;
}

/** Live-region texts for dnd-kit, in the form "Picked up KAN-12. Over Sprint 2, position 3 of 5". */
export function createDragAnnouncements({ getKey, describe }: AnnouncementSource): Announcements {
  return {
    onDragStart: ({ active }) => `Picked up ${getKey(String(active.id))}.`,
    onDragOver: ({ active, over }) => {
      if (over === null) return `${getKey(String(active.id))} is not over a list.`;
      const placement = describe(String(over.id));
      return placement === null
        ? undefined
        : `${getKey(String(active.id))} is over ${formatPlacement(placement)}.`;
    },
    onDragEnd: ({ active, over }) => {
      const key = getKey(String(active.id));
      if (over === null) return `${key} was dropped outside a list and stays where it was.`;
      const placement = describe(String(over.id));
      return placement === null ? `Dropped ${key}.` : `Dropped ${key} at ${formatPlacement(placement)}.`;
    },
    onDragCancel: ({ active }) => `Move cancelled. ${getKey(String(active.id))} stays where it was.`,
  };
}
