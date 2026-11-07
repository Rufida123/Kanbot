import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useId } from 'react';
import { isDraftTitleMissing } from '@/features/ai/utils/draftSelectors';
import type { TodoDraft } from '@/features/ai/utils/toDrafts';
import { NOT_ESTIMATED_LABEL, TODO_LIMITS } from '@/features/todos';
import { PRIORITY_OPTIONS, STORY_POINT_VALUES, TYPE_OPTIONS } from '@/shared/config/constants';
import { TODO_PRIORITIES, TODO_TYPES } from '@/shared/types/api';
import { isOneOf } from '@/shared/utils/isOneOf';

const NO_POINTS_VALUE = 'none';
const SELECT_MIN_WIDTH = '8rem';

export type DraftChanges = Partial<Omit<TodoDraft, 'id'>>;

type DraftRowProps = {
  draft: TodoDraft;
  /** 1-based, for the accessible names ("Title of todo 2"). */
  position: number;
  isDisabled: boolean;
  onChange: (draftId: string, changes: DraftChanges) => void;
};

/** One suggested todo: a checkbox, an editable title, type, priority and points. Nothing is saved from here. */
export function DraftRow({ draft, position, isDisabled, onChange }: DraftRowProps) {
  const id = useId();
  const isTitleMissing = draft.checked && isDraftTitleMissing(draft);

  return (
    <Paper variant="outlined" component="li" sx={{ listStyle: 'none', padding: 1.5, display: 'flex', gap: 1 }}>
      <Checkbox
        checked={draft.checked}
        disabled={isDisabled}
        onChange={(event) => onChange(draft.id, { checked: event.target.checked })}
        slotProps={{ input: { 'aria-label': `Add todo ${position} to the backlog` } }}
        sx={{ alignSelf: 'flex-start', marginTop: 0.25 }}
      />
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <TextField
          size="small"
          fullWidth
          value={draft.title}
          disabled={isDisabled}
          placeholder="Title"
          error={isTitleMissing}
          helperText={isTitleMissing ? 'Title is required' : undefined}
          onChange={(event) => onChange(draft.id, { title: event.target.value })}
          slotProps={{
            htmlInput: { 'aria-label': `Title of todo ${position}`, maxLength: TODO_LIMITS.titleMax, dir: 'auto' },
          }}
        />
        {draft.description === '' ? null : (
          <Typography
            variant="caption"
            color="text.secondary"
            dir="auto"
            sx={{
              overflowWrap: 'anywhere',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {draft.description}
          </Typography>
        )}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <FormControl size="small" disabled={isDisabled} sx={{ minWidth: SELECT_MIN_WIDTH }}>
            <InputLabel id={`${id}-type`}>Type</InputLabel>
            <Select
              labelId={`${id}-type`}
              label="Type"
              value={draft.type}
              onChange={(event) => {
                if (isOneOf(TODO_TYPES, event.target.value)) onChange(draft.id, { type: event.target.value });
              }}
            >
              {TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" disabled={isDisabled} sx={{ minWidth: SELECT_MIN_WIDTH }}>
            <InputLabel id={`${id}-priority`}>Priority</InputLabel>
            <Select
              labelId={`${id}-priority`}
              label="Priority"
              value={draft.priority}
              onChange={(event) => {
                if (isOneOf(TODO_PRIORITIES, event.target.value)) {
                  onChange(draft.id, { priority: event.target.value });
                }
              }}
            >
              {PRIORITY_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" disabled={isDisabled} sx={{ minWidth: SELECT_MIN_WIDTH }}>
            <InputLabel id={`${id}-points`}>Points</InputLabel>
            <Select
              labelId={`${id}-points`}
              label="Points"
              value={draft.storyPoints === null ? NO_POINTS_VALUE : String(draft.storyPoints)}
              onChange={(event) => {
                const points = STORY_POINT_VALUES.find((value) => String(value) === event.target.value);
                onChange(draft.id, { storyPoints: points ?? null });
              }}
            >
              <MenuItem value={NO_POINTS_VALUE}>{NOT_ESTIMATED_LABEL}</MenuItem>
              {STORY_POINT_VALUES.map((value) => (
                <MenuItem key={value} value={String(value)}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
    </Paper>
  );
}
