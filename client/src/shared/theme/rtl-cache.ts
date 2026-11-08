import rtlPlugin from 'stylis-plugin-rtl';
import createCache from '@emotion/cache';

// Create cache with RTL plugin
export const rtlCache = createCache({
  key: 'muirtl',
  stylisPlugins: [rtlPlugin],
});

// Create cache without RTL plugin for LTR
export const ltrCache = createCache({
  key: 'muilt',
});
