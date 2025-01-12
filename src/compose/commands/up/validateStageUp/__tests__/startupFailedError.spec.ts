import { describe, expect, it } from 'vitest';
import { throwStartupFailedError } from '../startupFailedError';

describe('throwStartupFailedError', () => {
  it('should throw an error with the correct message', () => {
    const id = 'test-container';
    const stageId = 'test-stage';
    const log = {
      'entities-stage': {
        allSucceeded: true,
        containerStatuses: {
          entities: 'done',
        },
      },
      'notifications-stage': {
        allSucceeded: false,
        containerStatuses: {
          notifications: 'fail',
        },
      },
    };

    expect(() => throwStartupFailedError({ id, stageId, log })).toThrowErrorMatchingSnapshot();
  });

  it('should handle multiple container IDs correctly', () => {
    const id = ['container1', 'container2'];
    const stageId = 'another-stage';
    const log = {
      'entities-stage': {
        allSucceeded: false,
        containerStatuses: {
          container1: 'idle',
          container2: 'pending',
        },
      },
    };

    expect(() => throwStartupFailedError({ id, stageId, log })).toThrowErrorMatchingSnapshot();
  });
});
