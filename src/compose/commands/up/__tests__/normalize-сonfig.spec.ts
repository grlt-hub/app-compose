import { createRandomContainer } from '@randomContainer';
import { LIBRARY_NAME } from '@shared';
import { randomUUID } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import { normalizeConfig } from '../normalizeConfig';

describe('normalizeConfig', () => {
  it('should return default values if no config is provided', () => {
    const result = normalizeConfig(undefined);

    expect(result).toEqual({
      debug: false,
      onContainerFail: expect.any(Function),
    });
  });

  it('should override default values with provided config', () => {
    const customConfig = {
      debug: true,
      onContainerFail: vi.fn(() => '_'),
    };

    const result = normalizeConfig(customConfig);

    expect(result).toEqual(customConfig);
    expect(result.onContainerFail).toBe(customConfig.onContainerFail);
  });

  it('should use default onContainerFail if not provided', () => {
    const customConfig = { debug: true };

    const result = normalizeConfig(customConfig);

    expect(result.debug).toBe(true);
    expect(result.onContainerFail).toEqual(expect.any(Function));
  });

  it('should call default onContainerFail with correct parameters', () => {
    const mockError = new Error('Test error');
    const mockContainer = createRandomContainer();
    const stageId = randomUUID();

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = normalizeConfig(undefined);
    result.onContainerFail({
      container: mockContainer,
      stageId,
      error: mockError,
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `${LIBRARY_NAME} Container "${mockContainer.id}" failed with error: Test error on stage "${stageId}"`,
    );
    if (mockError.stack) {
      expect(consoleErrorSpy).toHaveBeenCalledWith(`Stack trace:\n${mockError.stack}`);
    }

    consoleErrorSpy.mockRestore();
  });
});
