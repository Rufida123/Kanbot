import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined';
import { EmptyState } from '@/shared/components/EmptyState';

/** Placeholder until Sprint 4 builds the real page. */
export default function SprintsPage() {
  return (
    <>
      <title>Sprints · Kanbot</title>
      <EmptyState
        headingComponent="h1"
        icon={<ConstructionOutlinedIcon fontSize="large" />}
        title="Sprints: coming in Sprint 4"
        message="Sprint planning and history will live here."
      />
    </>
  );
}
