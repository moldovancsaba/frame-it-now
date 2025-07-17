/**
 * URL Validation Utility
 * 
 * This module provides a comprehensive set of functions for URL validation,
 * including structure validation, security checks, and content-type verification.
 * It follows a consistent error handling pattern and provides type-safe interfaces.
 */

// Type definitions for validation results and errors
export interface ValidationError {
  code: 'INVALID_URL' | 'INSECURE_URL' | 'INVALID_CONTENT' | 'NETWORK_ERROR';
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: ValidationError;
}

/**
 * Validates if the provided string is a properly formatted URL
 * Uses URL constructor for robust parsing and validation
 * 
 * @param url - The URL string to validate
 * @returns boolean indicating if the URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if the URL uses HTTPS protocol and follows security best practices
 * Verifies both protocol and basic security requirements
 * 
 * @param url - The URL string to check for security
 * @returns boolean indicating if the URL is secure
 */
export function isSecureUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Verifies the content type of the resource at the given URL
 * Makes a HEAD request to check the Content-Type header
 * 
 * @param url - The URL to check for content type
 * @returns Promise resolving to boolean indicating if content type is valid
 */
export async function validateContentType(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    return !!contentType && contentType.length > 0;
  } catch {
    return false;
  }
}

/**
 * Formats error messages for URL validation failures
 * Provides consistent error messaging across validation functions
 * 
 * @param error - The ValidationError object to format
 * @returns Formatted error message string
 */
export function formatErrorMessage(error: ValidationError): string {
  const errorMessages = {
    'INVALID_URL': 'The provided URL is not properly formatted',
    'INSECURE_URL': 'The URL must use HTTPS protocol',
    'INVALID_CONTENT': 'Unable to verify content type of the resource',
    'NETWORK_ERROR': 'Network error occurred while validating the URL'
  };

  return errorMessages[error.code] || error.message;
}

/**
 * Utility function to validate a URL comprehensively
 * Combines structure, security, and content validation
 * 
 * @param url - The URL to validate
 * @returns Promise<ValidationResult> with validation status and any errors
 */
export async function validateUrl(url: string): Promise<ValidationResult> {
  // Check basic URL structure
  if (!isValidUrl(url)) {
    return {
      isValid: false,
      error: {
        code: 'INVALID_URL',
        message: 'Invalid URL format'
      }
    };
  }

  // Check HTTPS security
  if (!isSecureUrl(url)) {
    return {
      isValid: false,
      error: {
        code: 'INSECURE_URL',
        message: 'URL must use HTTPS protocol'
      }
    };
  }

  // Verify content type
  try {
    const hasValidContent = await validateContentType(url);
    if (!hasValidContent) {
      return {
        isValid: false,
        error: {
          code: 'INVALID_CONTENT',
          message: 'Invalid or missing content type'
        }
      };
    }
  } catch {
    return {
      isValid: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Failed to validate URL content'
      }
    };
  }

  return { isValid: true };
}
