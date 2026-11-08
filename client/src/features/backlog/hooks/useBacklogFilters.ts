import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { FILTER_PARAMS } from '@/app/navigation';
import { SEARCH_DEBOUNCE_MS } from '@/features/backlog/config/filters';
import { parseEnumParam } from '@/features/backlog/utils/parseFilterParam';
import { TODO_LIMITS } from '@/features/todos/config/limits';
import { buildTodoListFilters } from '@/features/todos/utils/buildTodoFilters';
import { TODO_PRIORITIES, TODO_TYPES } from '@/shared/types/api';
import type { TodoPriority, TodoType } from '@/shared/types/api';

/**
 * The backlog filters (BL-6) live in the URL (`?q=&priority=&type=`) so a reload or a shared
 * link keeps them. Every update uses the functional form of `setSearchParams` and keeps the other
 * params (for example `?todo=`), and replaces the history entry: filtering is not navigation.
 *
 * Two values exist for the search: `searchInput` follows every keystroke, while the URL (and
 * through it the query key) only changes after the user pauses typing.
 */
export function useBacklogFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = (searchParams.get(FILTER_PARAMS.search) ?? '').slice(0, TODO_LIMITS.searchMax);
  const priority = parseEnumParam<TodoPriority>(TODO_PRIORITIES, searchParams.get(FILTER_PARAMS.priority));
  const type = parseEnumParam<TodoType>(TODO_TYPES, searchParams.get(FILTER_PARAMS.type));

  const rawLabel = searchParams.get(FILTER_PARAMS.label);
  const label = rawLabel === null || rawLabel === '' ? null : rawLabel.slice(0, TODO_LIMITS.labelMax);
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [lastWrittenSearch, setLastWrittenSearch] = useState(urlSearch);
  const [previousUrlSearch, setPreviousUrlSearch] = useState(urlSearch);

  // The URL changed from outside (Back, Forward, a link): the input follows it. Our own debounced
  // writes are recognised by `lastWrittenSearch` and never overwrite what is being typed.
  if (urlSearch !== previousUrlSearch) {
    setPreviousUrlSearch(urlSearch);
    if (urlSearch !== lastWrittenSearch) {
      setSearchInput(urlSearch);
      setLastWrittenSearch(urlSearch);
    }
  }

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          for (const [name, value] of Object.entries(updates)) {
            if (value === '') next.delete(name);
            else next.set(name, value);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === urlSearch) return;
    const timer = setTimeout(() => {
      setLastWrittenSearch(trimmed);
      updateParams({ [FILTER_PARAMS.search]: trimmed });
    }, SEARCH_DEBOUNCE_MS);
    // Cleared on every keystroke and on unmount (AI_RULES §5).
    return () => clearTimeout(timer);
  }, [searchInput, urlSearch, updateParams]);

  const setPriority = (value: TodoPriority | null) =>
    updateParams({ [FILTER_PARAMS.priority]: value ?? '' });
  const setType = (value: TodoType | null) => updateParams({ [FILTER_PARAMS.type]: value ?? '' });

  const setLabel = (value: string | null) => updateParams({ [FILTER_PARAMS.label]: value ?? '' });
  const clearFilters = () => {
    setSearchInput('');
    setLastWrittenSearch('');
    updateParams({
      [FILTER_PARAMS.search]: '',
      [FILTER_PARAMS.priority]: '',
      [FILTER_PARAMS.type]: '',
      [FILTER_PARAMS.label]: '',
    });
  };

  return {
    searchInput,
    setSearchInput,
    priority,
    setPriority,
    type,
    setType,
    label,
    setLabel,
    clearFilters,
    /** The filters the list is loaded with: the search is the debounced (URL) value. */
    appliedFilters: buildTodoListFilters({ search: urlSearch, priority, type }),
    /** Anything is typed or selected, so "Clear filters" has something to clear. */
    hasActiveFilters: searchInput.trim() !== '' || priority !== null || type !== null || label !== null,
  };
}
