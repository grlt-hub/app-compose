import type { AnyContainer } from '../createContainer';

export const printSkippedContainers = (skipped: Record<AnyContainer['id'], AnyContainer['id'][]>) => {
  if (Object.keys(skipped).length > 0) {
    console.info(skipped);
  }
};
