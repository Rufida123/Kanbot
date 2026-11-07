import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

type StatTileProps = { label: string; value: string };

/** A number with its label, for the sprint details. */
export function StatTile({ label, value }: StatTileProps) {
  return (
    <Paper variant="outlined" sx={{ padding: 2, display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Box component="p" sx={{ typography: 'h3', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Box>
    </Paper>
  );
}
