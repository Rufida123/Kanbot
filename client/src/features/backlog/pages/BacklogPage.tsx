import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined';
import { EmptyState } from '@/shared/components/EmptyState';

/** Placeholder until Sprint 3 builds the real page. */
export default function BacklogPage() {
  return (
    <>
      <title>Backlog · Kanbot</title>
      <EmptyState
        headingComponent="h1"
        icon={<ConstructionOutlinedIcon fontSize="large" />}
        title="Backlog: coming in Sprint 3"
        message="Your backlog and todo details will live here."
      />
    </>
  );
}
