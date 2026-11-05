import '@mui/material/styles';
import type { TodoPriority, TodoStatus } from '@/shared/types/api';

declare module '@mui/material/styles' {
  interface Palette {
    status: Record<TodoStatus, string>;
    priority: Record<TodoPriority, string>;
    focusRing: string;
  }
  interface PaletteOptions {
    status?: Record<TodoStatus, string>;
    priority?: Record<TodoPriority, string>;
    focusRing?: string;
  }
  interface TypeBackground {
    overlay: string;
  }
}
