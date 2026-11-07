import { useCallback, useEffect, useRef } from 'react';

/**
 * One cancellable request at a time. `start()` aborts the previous request and returns the
 * signal for the next one; the request in flight is aborted when the component unmounts
 * (AI_RULES §5: cancel in-flight requests on unmount).
 */
export function useAbortSignal() {
  const controllerRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  const start = useCallback((): AbortSignal => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    return controller.signal;
  }, []);

  useEffect(() => abort, [abort]);

  return { start, abort };
}
