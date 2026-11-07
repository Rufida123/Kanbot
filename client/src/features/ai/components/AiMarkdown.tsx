import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import type { SxProps, Theme } from '@mui/material/styles';
import Markdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

const REMARK_PLUGINS = [remarkGfm];
/** A remote image from the AI would be a tracking request. `unwrapDisallowed` keeps any text inside. */
const DISALLOWED_ELEMENTS = ['img'];

const COMPONENTS: Components = {
  a: ({ href, children }) => (
    <Link href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </Link>
  ),
  // Wide tables scroll inside their own box instead of widening the page.
  table: ({ children }) => (
    <Box sx={{ overflowX: 'auto', marginBlock: 1 }}>
      <table>{children}</table>
    </Box>
  ),
};

/** The global reset removes every margin and list padding, so the Markdown elements get theirs back here. */
const MARKDOWN_SX: SxProps<Theme> = {
  overflowWrap: 'anywhere',
  '& > :first-child': { marginTop: 0 },
  '& > :last-child': { marginBottom: 0 },
  '& p, & ul, & ol, & pre, & blockquote, & hr': { marginBlock: 1 },
  '& ul, & ol': { paddingInlineStart: 3 },
  '& li > p': { marginBlock: 0 },
  '& h1, & h2, & h3, & h4, & h5, & h6': { typography: 'subtitle1', marginBlock: 1 },
  '& blockquote': {
    paddingInlineStart: 1.5,
    borderInlineStart: 3,
    borderColor: 'divider',
    color: 'text.secondary',
  },
  '& code': {
    fontFamily: 'monospace',
    fontSize: '0.875em',
    paddingInline: 0.5,
    borderRadius: 0.5,
    backgroundColor: 'action.hover',
  },
  '& pre': {
    overflowX: 'auto',
    padding: 1.5,
    borderRadius: 1,
    backgroundColor: 'action.hover',
  },
  '& pre code': { padding: 0, backgroundColor: 'transparent', overflowWrap: 'normal' },
  '& table': { borderCollapse: 'collapse' },
  '& th, & td': { border: 1, borderColor: 'divider', paddingBlock: 0.5, paddingInline: 1, textAlign: 'start' },
  '& th': { fontWeight: 'fontWeightMedium' },
  '& hr': { border: 0, borderTop: 1, borderColor: 'divider' },
};

type AiMarkdownProps = { content: string };

/**
 * Renders the Markdown of an AI answer (NFR-7). Raw HTML is never rendered: no HTML plugin is
 * used and nothing is injected as a string, images are removed, and the library's default URL
 * check stays on (so `javascript:` links are dropped). Links open in a new tab without a referrer.
 */
export function AiMarkdown({ content }: AiMarkdownProps) {
  return (
    <Box dir="auto" sx={MARKDOWN_SX}>
      <Markdown
        remarkPlugins={REMARK_PLUGINS}
        disallowedElements={DISALLOWED_ELEMENTS}
        unwrapDisallowed
        components={COMPONENTS}
      >
        {content}
      </Markdown>
    </Box>
  );
}
