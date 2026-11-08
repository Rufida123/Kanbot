import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { DueBadge } from '@/shared/components/DueBadge';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { LabelChips } from '@/shared/components/LabelChips';
import { PointsChip } from '@/shared/components/PointsChip';
import { PriorityBadge } from '@/shared/components/PriorityBadge';
import { TodoRowSkeleton } from '@/features/todos';
import { TodoRow } from '@/features/todos';
import type { Todo } from '@/shared/types/api';

const meta: Meta = { title: 'Shared components' };
export default meta;
type Story = StoryObj;

const todo: Todo = { id: 't1', projectId: 'p1', key: 'DEM-1', title: 'Write the documentation / كتابة التوثيق', description: '', sprintId: null, type: 'story', status: 'todo', priority: 'high', storyPoints: 5, labels: ['docs', 'تصميم'], dueDate: '2020-01-01', order: 0, createdAt: '', updatedAt: '', completedAt: null } as Todo;

export const Buttons: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      <Button variant="contained">Primary</Button>
      <Button variant="outlined">Secondary</Button>
      <Button>Text</Button>
      <Button variant="contained" disabled>Disabled</Button>
      <Button variant="contained" color="error">Delete</Button>
    </Box>
  ),
};

export const Dialog: Story = {
  render: () => (
    <ConfirmDialog open title="Delete project?" confirmLabel="Delete" isDestructive onConfirm={() => undefined} onCancel={() => undefined}>
      This cannot be undone.
    </ConfirmDialog>
  ),
};

export const Cards: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 720 }}>
      <TodoRow todo={todo} index={0} onOpen={() => undefined} onDelete={() => undefined} />
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
        <PriorityBadge priority="urgent" />
        <PointsChip points={8} />
        <LabelChips labels={['docs', 'bug', 'ui', 'api']} max={3} />
        <DueBadge dueDate="2030-01-01" />
      </Box>
    </Box>
  ),
};

export const EmptyStates: Story = {
  render: () => <EmptyState icon={<InboxOutlinedIcon fontSize="large" />} title="Your backlog is empty" message="Add the work you want to do." action={<Button variant="contained">Create todo</Button>} />,
};

export const ErrorStates: Story = { render: () => <ErrorState title="We couldn’t load the backlog" message="Cannot reach the server." onRetry={() => undefined} /> };

export const Skeletons: Story = {
  render: () => (
    <Box sx={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TodoRowSkeleton count={3} />
      <Skeleton variant="rounded" height={96} />
    </Box>
  ),
};
