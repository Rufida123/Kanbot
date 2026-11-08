import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';
import { useUiStore } from '@/shared/stores/uiStore';
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
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const createMutation = useCreateTodo(projectId);
  const ownRef = useRef<HTMLInputElement | null>(null);
  const createSignal = useUiStore((state) => state.createTodoSignal);
  // `c` (or the palette) asks the backlog to focus its quick-create field.
  useEffect(() => {
    if (createSignal > 0) ownRef.current?.focus();
  }, [createSignal]);

  const create = async (newTitle: string) => {
    try {
      const todo = await createMutation.mutateAsync({ projectId, request: { title: newTitle } });
      setAnnouncement(t('todos:quick.created', { key: todo.key }));
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
        inputRef={(element: HTMLInputElement | null) => {
          ownRef.current = element;
          if (typeof inputRef === 'function') inputRef(element);
          else if (inputRef) (inputRef as { current: HTMLInputElement | null }).current = element;
        }}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('todos:quick.placeholder')}
        autoComplete="off"
        inputProps={{ dir: 'auto', 'aria-keyshortcuts': 'c', 'aria-label': t('todos:quick.label'), maxLength: TODO_LIMITS.titleMax }}
        sx={{ paddingBlock: 0.75 }}
      />
      <Typography
        variant="caption"
        color="text.secondary"
        aria-hidden="true"
        sx={{ display: { xs: 'none', sm: 'block' }, whiteSpace: 'nowrap' }}
      >
        {t('todos:quick.hint')}
      </Typography>
      <Box role="status">
        <VisuallyHidden>{announcement}</VisuallyHidden>
      </Box>
    </Box>
  );
}
