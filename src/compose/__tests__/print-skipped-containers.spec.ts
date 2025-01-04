import { printSkippedContainers } from '../printSkippedContainers';

describe('printSkippedContainers', () => {
  it('should not log anything if skipped is an empty object', () => {
    const consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
    const consoleGroupCollapsedSpy = vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {});

    printSkippedContainers({}, 'x');

    expect(consoleGroupSpy).not.toHaveBeenCalled();
    expect(consoleLogSpy).not.toHaveBeenCalled();
    expect(consoleGroupEndSpy).not.toHaveBeenCalled();
    expect(consoleGroupCollapsedSpy).not.toHaveBeenCalled();

    vi.restoreAllMocks();
  });

  it('should log skipped containers and their dependencies correctly', () => {
    const consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
    const consoleGroupCollapsedSpy = vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {});

    const skipped = {
      containerA: ['dep1', 'dep2'],
      containerB: ['dep2'],
      containerC: ['dep3'],
    };

    printSkippedContainers(skipped, 'x');

    // Verify that groups are opened correctly
    {
      expect(consoleGroupSpy).toHaveBeenCalledWith(
        '%c[app-compose] Skipped Containers (stage "x")',
        'color: #E2A03F; font-weight: bold;',
      );
    }

    // Verify dependencies are logged
    {
      expect(consoleGroupCollapsedSpy).toHaveBeenCalledWith('%c- dep1', 'color: #61afef;');
      expect(consoleGroupCollapsedSpy).toHaveBeenCalledWith('%c- dep2', 'color: #61afef;');
      expect(consoleGroupCollapsedSpy).toHaveBeenCalledWith('%c- dep3', 'color: #61afef;');
    }

    // Verify usage of containers
    {
      expect(consoleLogSpy).toHaveBeenCalledWith('%c Used in:', 'font-style: italic;');
      expect(consoleLogSpy).toHaveBeenCalledWith('- containerA');
      expect(consoleLogSpy).toHaveBeenCalledWith('- containerB');
      expect(consoleLogSpy).toHaveBeenCalledWith('- containerC');
    }

    // Verify explanation message
    {
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '%c' +
          'All skipped containers are optional. If they are expected to work, please include them in the list when calling `compose` function',
        'color: #888888; font-style: italic;',
      );
    }

    // Verify groups are closed
    {
      expect(consoleGroupEndSpy).toHaveBeenCalledTimes(4);
    }

    vi.restoreAllMocks();
  });
});
