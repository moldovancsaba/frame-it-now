import { Navigation } from '../navigation';

/**
 * Test-friendly mock navigation service
 * Use this in tests to avoid actual page reloads
 */
export const createMockNavigation = (): Navigation => ({
  reload: jest.fn()
});
