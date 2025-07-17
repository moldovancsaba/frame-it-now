import { NextApiRequest } from 'next';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors?: ValidationError[];
}

/**
 * Validates asset request payload based on type and action
 * Ensures required fields are present and have correct types/formats
 */
export const validateAssetRequest = (
  req: NextApiRequest
): ValidationResult => {
  const { type, action } = req.query;
  const errors: ValidationError[] = [];

  // Validate request method based on action
  if (action === 'create' && req.method !== 'POST') {
    errors.push({
      field: 'method',
      message: `Invalid method ${req.method} for create action. Expected POST`
    });
  }

  if (action === 'update' && req.method !== 'PUT') {
    errors.push({
      field: 'method',
      message: `Invalid method ${req.method} for update action. Expected PUT`
    });
  }

  if (action === 'delete' && req.method !== 'DELETE') {
    errors.push({
      field: 'method',
      message: `Invalid method ${req.method} for delete action. Expected DELETE`
    });
  }

  // Validate asset type
  if (!type || typeof type !== 'string') {
    errors.push({
      field: 'type',
      message: 'Asset type is required and must be a string'
    });
  }

  // Validate payload based on action
  if (action === 'create') {
    const body = req.body as { name?: unknown; style?: unknown; url?: unknown };
    const { name } = body;

    if (!name || typeof name !== 'string') {
      errors.push({
        field: 'name',
        message: 'Name is required and must be a string'
      });
    }

    // Handle background-specific validation
    if (type === 'background') {
      const { style } = body;
      if (!style || typeof style !== 'string') {
        errors.push({
          field: 'style',
          message: 'Style is required and must be a string'
        });
      }
    } else {
      // Handle frame and guide validation
      const { url } = body;
      if (!url || typeof url !== 'string') {
        errors.push({
          field: 'url',
          message: 'URL is required and must be a string'
        });
      }
    }
  }

  if (action === 'delete') {
    const body = req.body as { id?: unknown };
    const { id } = body;
    if (!id || typeof id !== 'string') {
      errors.push({
        field: 'id',
        message: 'Asset ID is required for deletion and must be a string'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
};
