import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { PointsChip } from '@/shared/components/PointsChip';
import { PriorityBadge } from '@/shared/components/PriorityBadge';
import { TypeIcon } from '@/shared/components/TypeIcon';
import type { Todo } from '@/shared/types/api';

type PlanTodoRowProps = {
  todo: Todo;
  isChecked: boolean;
  isDisabled: boolean;
  onToggle: (todoId: string) => void;
};

/** A todo of the suggested plan with a checkbox. Unchecking it only changes the plan, not the todo. */
export function PlanTodoRow({ todo, isChecked, isDisabled, onToggle }: PlanTodoRowProps) {
  return (
    <Box component="li" sx={{ listStyle: 'none', paddingInline: 1, borderBottom: 1, borderColor: 'divider' }}>
      <FormControlLabel
        disabled={isDisabled}
        sx={{ display: 'flex', marginInline: 0, width: '100%' }}
        control={<Checkbox checked={isChecked} onChange={() => onToggle(todo.id)} />}
        slotProps={{ typography: { component: 'div', sx: { flex: 1, minWidth: 0 } } }}
        label={
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 1.5, rowGap: 0.5 }}>
            <TypeIcon type={todo.type} />
            <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
              {todo.key}
            </Box>
            <Box component="span" dir="auto" sx={{ flex: '1 1 10rem', minWidth: 0, overflowWrap: 'anywhere' }}>
              {todo.title}
            </Box>
            <PriorityBadge priority={todo.priority} />
            <PointsChip points={todo.storyPoints} />
          </Box>
        }
      />
    </Box>
  );
}
