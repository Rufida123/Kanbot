import type { Announcements } from '@dnd-kit/core';
import { t } from '@/shared/i18n';

/** Where an item or list currently is, for example "Sprint 2, position 3 of 5". */
export type Placement = { listLabel: string; position: number; total: number };

type AnnouncementSource = {
  getKey: (todoId: string) => string;
  describe: (id: string) => Placement | null;
};

function formatPlacement({ listLabel, position, total }: Placement): string {
  if (total === 0) return t('backlog:dnd.emptyList', { list: listLabel });
  return t('backlog:dnd.position', { list: listLabel, position, total });
}

/**
 * Live-region texts for dnd-kit (translated), in the form "Picked up KAN-12. Over Sprint 2,
 * position 3 of 5". The screen-reader instructions differ per drag area, so they are passed to
 * `DndContext` by it.
 */
export function createDragAnnouncements({ getKey, describe }: AnnouncementSource): Announcements {
  return {
    onDragStart: ({ active }) => t('backlog:dnd.pickedUp', { key: getKey(String(active.id)) }),
    onDragOver: ({ active, over }) => {
      const key = getKey(String(active.id));
      if (over === null) return t('backlog:dnd.notOverList', { key });
      const placement = describe(String(over.id));
      return placement === null ? undefined : t('backlog:dnd.isOver', { key, placement: formatPlacement(placement) });
    },
    onDragEnd: ({ active, over }) => {
      const key = getKey(String(active.id));
      if (over === null) return t('backlog:dnd.droppedOutside', { key });
      const placement = describe(String(over.id));
      return placement === null ? t('backlog:dnd.dropped', { key }) : t('backlog:dnd.droppedAt', { key, placement: formatPlacement(placement) });
    },
    onDragCancel: ({ active }) => t('backlog:dnd.cancelled', { key: getKey(String(active.id)) }),
  };
}
