import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined';
import { EmptyState } from '@/shared/components/EmptyState';

/** Placeholder until Sprint 5 builds the real page. */
export default function SprintDetailsPage() {
  return (
    <>
      <title>Sprint details · Kanbot</title>
      <EmptyState
        headingComponent="h1"
        icon={<ConstructionOutlinedIcon fontSize="large" />}
        title="Sprint details: coming in Sprint 5"
        message="A sprint's todos and summary will live here."
      />
    </>
  );
}
