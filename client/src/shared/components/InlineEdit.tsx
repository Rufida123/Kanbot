import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useId, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { STORY_POINT_VALUES } from '@/shared/config/constants';
import { PRIORITY_OPTIONS } from '@/shared/config/constants';
import type { StoryPoints, TodoPriority } from '@/shared/types/api';

type InlineTextProps = {
  value: string;
  maxLength: number;
  /** Returns an error message to keep the editor open, or `null` when the change is accepted. */
  onCommit: (value: string) => string | null;
  /** Content shown while not editing. */
  children: ReactNode;
  ariaLabel: string;
  isDisabled?: boolean;
  /** Increment to start editing from outside (the "Rename" menu item: the keyboard path). */
  startSignal?: number;
};

/**
 * Inline title editing (enhancement 6). Enter or double-click on the title starts editing,
 * Enter / blur saves, Esc cancels. Empty titles are rejected with an inline message.
 * (A single click still opens the details dialog, as in the base app.)
 */
export function InlineText({ value, maxLength, onCommit, children, ariaLabel, isDisabled = false, startSignal = 0 }: InlineTextProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const errorId = useId();
  const cancelledRef = useRef(false);

  const lastSignal = useRef(startSignal);
  const start = () => {
    if (isDisabled) return;
    cancelledRef.current = false;
    setDraft(value);
    setError(null);
    setIsEditing(true);
  };
  if (startSignal !== lastSignal.current) {
    lastSignal.current = startSignal;
    if (!isEditing && !isDisabled) {
      cancelledRef.current = false;
      setDraft(value);
      setError(null);
      setIsEditing(true);
    }
  }
  const finish = () => {
    if (cancelledRef.current) return;
    const trimmed = draft.trim();
    if (trimmed === value.trim()) {
      setIsEditing(false);
      return;
    }
    const message = onCommit(trimmed);
    if (message === null) setIsEditing(false);
    else setError(message);
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      cancelledRef.current = true;
      setIsEditing(false);
    } else if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
      event.preventDefault();
      finish();
    }
  };

  if (!isEditing) {
    return (
      <Box component="span" onDoubleClick={(event) => { event.stopPropagation(); start(); }} title={isDisabled ? undefined : t('todos:inline.editHint')} sx={{ display: 'contents' }}>
        {children}
      </Box>
    );
  }
  return (
    <Box component="span" sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
      <InputBase
        autoFocus
        fullWidth
        value={draft}
        onChange={(event) => { setDraft(event.target.value); setError(null); }}
        onKeyDown={onKeyDown}
        onBlur={finish}
        onClick={(event) => event.stopPropagation()}
        error={error !== null}
        inputProps={{ 'aria-label': ariaLabel, 'aria-invalid': error !== null, 'aria-describedby': error ? errorId : undefined, maxLength, dir: 'auto' }}
        sx={{ border: 1, borderColor: error ? 'error.main' : 'primary.main', borderRadius: 1, paddingInline: 1 }}
      />
      {error ? <Box id={errorId} role="alert" component="span" sx={{ color: 'error.main', fontSize: '0.75rem' }}>{error}</Box> : null}
    </Box>
  );
}

type InlineMenuProps<TValue> = {
  ariaLabel: string;
  options: readonly { value: TValue; label: string }[];
  value: TValue;
  onChange: (value: TValue) => void;
  children: ReactNode;
  isDisabled?: boolean;
};

/** A badge that opens a small menu to change one field in place (priority, points). */
function InlineMenu<TValue extends string | number | null>({ ariaLabel, options, value, onChange, children, isDisabled = false }: InlineMenuProps<TValue>) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const id = useId();
  if (isDisabled) return <>{children}</>;
  return (
    <>
      <Box
        component="button"
        type="button"
        id={`${id}-trigger`}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={anchor !== null}
        onClick={(event: React.MouseEvent<HTMLElement>) => { event.stopPropagation(); setAnchor(event.currentTarget); }}
        sx={{ all: 'unset', cursor: 'pointer', borderRadius: 1, display: 'inline-flex', minHeight: '1.5rem', '&:hover': { backgroundColor: 'action.hover' }, '&:focus-visible': { outline: '2px solid', outlineColor: 'focusRing', outlineOffset: '2px' } }}
      >
        {children}
      </Box>
      <Menu anchorEl={anchor} open={anchor !== null} onClose={() => setAnchor(null)} slotProps={{ list: { 'aria-labelledby': `${id}-trigger` } }}>
        {options.map((option) => (
          <MenuItem key={String(option.value)} selected={option.value === value} onClick={() => { setAnchor(null); if (option.value !== value) onChange(option.value); }}>
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export function InlinePriority(props: { value: TodoPriority; onChange: (value: TodoPriority) => void; children: ReactNode; isDisabled?: boolean; ariaLabel: string }) {
  return <InlineMenu<TodoPriority> {...props} options={PRIORITY_OPTIONS} />;
}

export function InlinePoints(props: { value: StoryPoints | null; onChange: (value: StoryPoints | null) => void; children: ReactNode; isDisabled?: boolean; ariaLabel: string; notEstimatedLabel: string }) {
  const { notEstimatedLabel, ...rest } = props;
  const options: { value: StoryPoints | null; label: string }[] = [{ value: null, label: notEstimatedLabel }, ...STORY_POINT_VALUES.map((points) => ({ value: points, label: String(points) }))];
  return <InlineMenu<StoryPoints | null> {...rest} options={options} />;
}
