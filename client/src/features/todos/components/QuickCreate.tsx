import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import type { KeyboardEvent, Ref } from 'react';
import { TODO_LIMITS } from '@/features/todos/config/limits';
import { useCreateTodo } from '@/features/todos/hooks/useCreateTodo';
import { VisuallyHidden } from '@/shared/components/VisuallyHidden';

type QuickCreateProps = {
  projectId: string;
  /** Lets the empty state focus the input. */
  inputRef?: Ref<HTMLInputElement>;
};

/**
 * Inline "+ Create todo" row (BL-2). Enter adds a task with a medium priority and keeps the
 * focus, so several todos can be typed in a row while earlier ones are still being saved
 * (the requests run in order). Esc clears the text and leaves the field.
 */
export function QuickCreate({ projectId, inputRef }: QuickCreateProps) {
  const [title, setTitle] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const createMutation = useCreateTodo(projectId);

  const create = async (newTitle: string) => {
    try {
      const todo = await createMutation.mutateAsync({ projectId, request: { title: newTitle } });
      setAnnouncement(`Created ${todo.key}`);
    } catch {
      // The toast comes from the hook. Put the text back, unless the user already typed the next one.
      setTitle((current) => (current === '' ? newTitle : current));
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === 'Escape') {
      setTitle('');
      event.currentTarget.blur();
      return;
    }
    if (event.key !== 'Enter') return;
    event.preventDefault();
    // Enter that confirms an IME composition (Japanese, Chinese…) must not create a todo.
    if (event.nativeEvent.isComposing) return;
    const trimmed = title.trim();
    if (trimmed === '') return;
    setTitle('');
    void create(trimmed);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        paddingBlock: 0.5,
        paddingInline: 2,
        borderTop: 1,
        borderStyle: 'dashed',
        borderColor: 'divider',
        transition: (theme) => theme.transitions.create('background-color'),
        '&:hover, &:focus-within': { backgroundColor: 'action.hover' },
      }}
    >
      <AddIcon fontSize="small" color="action" aria-hidden="true" />
      <InputBase
        fullWidth
        value={title}
        inputRef={inputRef}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Create todo: type a title and press Enter"
        autoComplete="off"
        inputProps={{ 'aria-label': 'Create todo', maxLength: TODO_LIMITS.titleMax }}
        sx={{ paddingBlock: 0.75 }}
      />
      <Typography
        variant="caption"
        color="text.secondary"
        aria-hidden="true"
        sx={{ display: { xs: 'none', sm: 'block' }, whiteSpace: 'nowrap' }}
      >
        Enter to add · Esc to clear
      </Typography>
      <Box role="status">
        <VisuallyHidden>{announcement}</VisuallyHidden>
      </Box>
    </Box>
  );
}
