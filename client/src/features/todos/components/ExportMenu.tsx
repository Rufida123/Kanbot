import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { downloadTextFile, safeFileName, todosToCsv, todosToMarkdown } from '@/features/todos/utils/exportTodos';
import type { ExportContext } from '@/features/todos/utils/exportTodos';
import { showToast } from '@/shared/stores/toastStore';
import type { Todo } from '@/shared/types/api';

type ExportMenuProps = {
  title: string;
  todos: readonly Todo[] | undefined;
  context: ExportContext;
  baseName: string;
};

/** "Export" button: Markdown or CSV download of the todos on screen (enhancement 13). */
export function ExportMenu({ title, todos, context, baseName }: ExportMenuProps) {
  const { t } = useTranslation();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const id = useId();
  const run = (kind: 'md' | 'csv') => {
    setAnchor(null);
    if (todos === undefined) return;
    const name = `${safeFileName(baseName)}.${kind}`;
    if (kind === 'csv') downloadTextFile(name, todosToCsv(todos, context), 'text/csv');
    else downloadTextFile(name, todosToMarkdown(title, todos, context), 'text/markdown');
    showToast(t('todos:export.done', { name }), 'info');
  };
  return (
    <>
      <Button
        id={`${id}-button`}
        color="inherit"
        variant="outlined"
        startIcon={<FileDownloadOutlinedIcon aria-hidden="true" />}
        aria-haspopup="menu"
        aria-expanded={anchor !== null}
        disabled={todos === undefined}
        onClick={(event) => setAnchor(event.currentTarget)}
      >
        {t('todos:export.button')}
      </Button>
      <Menu anchorEl={anchor} open={anchor !== null} onClose={() => setAnchor(null)} slotProps={{ list: { 'aria-labelledby': `${id}-button` } }}>
        <MenuItem onClick={() => run('md')}>{t('todos:export.markdown')}</MenuItem>
        <MenuItem onClick={() => run('csv')}>{t('todos:export.csv')}</MenuItem>
      </Menu>
    </>
  );
}
