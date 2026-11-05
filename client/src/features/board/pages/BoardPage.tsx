import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined';
import { EmptyState } from '@/shared/components/EmptyState';

/** Placeholder until Sprint 5 builds the real page. */
export default function BoardPage() {
  return (
    <>
      <title>Board · Kanbot</title>
      <EmptyState
        headingComponent="h1"
        icon={<ConstructionOutlinedIcon fontSize="large" />}
        title="Board: coming in Sprint 5"
        message="The sprint board will live here."
      />
    </>
  );
}
