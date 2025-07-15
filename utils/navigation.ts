/**
 * Navigation service to encapsulate browser navigation functions
 */
/**
 * Navigation service interface for browser navigation actions
 * This abstraction allows for better testing and potential future extensions
 */
export interface Navigation {
  /**
   * Reloads the current page
   * In production, uses window.location.reload()
   * In test environment, can be mocked
   */
  reload: () => void;
}

/**
 * Default implementation of the Navigation interface
 * Uses browser's native navigation APIs
 */
export class NavigationService implements Navigation {
  /**
   * Reloads the current page using the browser's native reload function
   * @throws {Error} If called in an environment where window.location is not available
   */
  reload(): void {
    if (typeof window === 'undefined') {
      throw new Error('NavigationService.reload() called in non-browser environment');
    }
    window.location.reload();
  }
}

/**
 * Singleton instance of the NavigationService
 * Use this for normal application operation
 */
export const defaultNavigation = new NavigationService();

