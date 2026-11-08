import { useTranslation } from 'react-i18next';
import CloseIcon from '@mui/icons-material/Close';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import type { KeyboardEvent } from 'react';
import { TODO_LIMITS } from '@/features/todos/config/limits';
import { PriorityBadge } from '@/shared/components/PriorityBadge';
import { TypeIcon } from '@/shared/components/TypeIcon';
import { PRIORITY_OPTIONS, TYPE_OPTIONS } from '@/shared/config/constants';
import { TODO_PRIORITIES, TODO_TYPES } from '@/shared/types/api';
import type { TodoPriority, TodoType } from '@/shared/types/api';
import { isOneOf } from '@/shared/utils/isOneOf';

const ALL = '';

type BacklogFiltersProps = {
  searchInput: string;
  onSearchChange: (value: string) => void;
  priority: TodoPriority | null;
  onPriorityChange: (value: TodoPriority | null) => void;
  type: TodoType | null;
  onTypeChange: (value: TodoType | null) => void;
  hasActiveFilters: boolean;
  onClear: () => void;
};

/** Search, priority and type (BL-6). Pure UI: the state lives in `useBacklogFilters`. */
export function BacklogFilters({
  searchInput,
  onSearchChange,
  priority,
  onPriorityChange,
  type,
  onTypeChange,
  hasActiveFilters,
  onClear,
}: BacklogFiltersProps) {
  const { t } = useTranslation();
  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === 'Escape' && searchInput !== '') {
      event.preventDefault();
      onSearchChange('');
    }
  };

  return (
    <Box
      component="search"
      data-backlog-search
      aria-label={t('backlog:filters.label')}
      sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}
    >
      <OutlinedInput
        value={searchInput}
        onChange={(event) => onSearchChange(event.target.value)}
        onKeyDown={handleSearchKeyDown}
        placeholder={t('backlog:filters.searchPlaceholder')}
        autoComplete="off"
        inputProps={{ dir: 'auto', 'aria-keyshortcuts': '/', 'aria-label': t('backlog:filters.search'), maxLength: TODO_LIMITS.searchMax }}
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon fontSize="small" aria-hidden="true" />
          </InputAdornment>
        }
        endAdornment={
          searchInput === '' ? null : (
            <InputAdornment position="end">
              <Tooltip title={t('backlog:filters.clearSearch')}>
                <IconButton size="small" edge="end" aria-label={t('backlog:filters.clearSearch')} onClick={() => onSearchChange('')}>
                  <CloseIcon fontSize="small" aria-hidden="true" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          )
        }
        sx={{ flex: '1 1 16rem', maxWidth: '26rem' }}
      />
      <Select
        displayEmpty
        value={priority ?? ALL}
        onChange={(event) => {
          const { value } = event.target;
          onPriorityChange(isOneOf(TODO_PRIORITIES, value) ? value : null);
        }}
        inputProps={{ 'aria-label': t('backlog:filters.byPriority') }}
        sx={{ minWidth: '10.5rem' }}
      >
        <MenuItem value={ALL}>{t('backlog:filters.allPriorities')}</MenuItem>
        {PRIORITY_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <PriorityBadge priority={option.value} />
          </MenuItem>
        ))}
      </Select>
      <Select
        displayEmpty
        value={type ?? ALL}
        onChange={(event) => {
          const { value } = event.target;
          onTypeChange(isOneOf(TODO_TYPES, value) ? value : null);
        }}
        inputProps={{ 'aria-label': t('backlog:filters.byType') }}
        sx={{ minWidth: '9.5rem' }}
      >
        <MenuItem value={ALL}>{t('backlog:filters.allTypes')}</MenuItem>
        {TYPE_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
              <TypeIcon type={option.value} />
              {option.label}
            </Box>
          </MenuItem>
        ))}
      </Select>
      {hasActiveFilters ? (
        <Button color="inherit" startIcon={<FilterListOffIcon aria-hidden="true" />} onClick={onClear}>
          {t('backlog:filters.clear')}
        </Button>
      ) : null}
    </Box>
  );
}
