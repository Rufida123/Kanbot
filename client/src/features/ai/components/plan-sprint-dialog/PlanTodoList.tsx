import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { PlanTodoRow } from '@/features/ai/components/plan-sprint-dialog/PlanTodoRow';
import type { Todo } from '@/shared/types/api';

type PlanTodoListProps = {
  /** Accessible name of the list. */
  label: string;
  /** Visible heading; absent for the main list (the dialog already says what it is). */
  heading?: string;
  todos: readonly Todo[];
  checkedIds: ReadonlySet<string>;
  isDisabled: boolean;
  onToggle: (todoId: string) => void;
};

/** A checkbox list of backlog todos for the plan. */
export function PlanTodoList({ label, heading, todos, checkedIds, isDisabled, onToggle }: PlanTodoListProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {heading === undefined ? null : (
        <Typography component="h3" variant="subtitle2">
          {heading}
        </Typography>
      )}
      <Box
        component="ul"
        aria-label={label}
        sx={{ padding: 0, border: 1, borderColor: 'divider', borderBottom: 0, borderRadius: 1 }}
      >
        {todos.map((todo) => (
          <PlanTodoRow
            key={todo.id}
            todo={todo}
            isChecked={checkedIds.has(todo.id)}
            isDisabled={isDisabled}
            onToggle={onToggle}
          />
        ))}
      </Box>
    </Box>
  );
}
