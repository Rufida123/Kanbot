import { TODO_STATUSES } from '@/shared/types/api';
import type { TodoStatus } from '@/shared/types/api';

/** Narrowest a board column gets before the columns area scrolls sideways. */
export const BOARD_COLUMN_MIN_WIDTH_REM = 17;

/** Height limit of a column's card list: the list scrolls, its header and the page header stay. */
export const BOARD_COLUMN_BODY_MAX_HEIGHT = 'calc(100dvh - 20rem)';
export const BOARD_COLUMN_BODY_MIN_HEIGHT_REM = 10;

/** Columns in display order (the API's order). */
export const BOARD_STATUSES: readonly TodoStatus[] = TODO_STATUSES;

export const MS_PER_DAY = 86_400_000;
