import { NextApiRequest, NextApiResponse } from 'next';
import { AssetService } from '../../../../../lib/services/assetService';
import { ApiResponse, AssetType } from '../../../../../types/admin';
import { validateAssetRequest, ValidationError } from '../../../../../lib/validation/assetValidation';

const assetService = new AssetService();

/**
 * Validate the asset type from the request
 */
const validateAssetType = (type: string): type is AssetType => {
  return ['frame', 'guide', 'background'].includes(type);
};

/**
 * Enhance error response with validation details
 */
interface ApiErrorResponse extends ApiResponse<never> {
  success: false;
  error: string;
  details?: ValidationError[];
}

/**
 * Handle asset management API requests
 * Supports CRUD operations for frames, guides, and backgrounds
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<unknown>>
): Promise<void> {
  const { type, action } = req.query;

  // Validate request and asset type
  const validationResult = validateAssetRequest(req);
  if (!validationResult.isValid) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: 'Invalid request',
      details: validationResult.errors
    };
    return res.status(400).json(errorResponse);
  }

  if (!validateAssetType(type as string)) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: 'Invalid asset type',
      details: [{ field: 'type', message: `Asset type must be one of: frame, guide, background` }]
    };
    return res.status(400).json(errorResponse);
  }

  const assetType = type as AssetType;

  try {
    switch (req.method) {
      case 'GET':
        switch (action) {
          case 'list': {
            const assets = await assetService.getAssets(assetType);
            return res.status(200).json({ success: true, data: assets });
          }

          case 'selected': {
            const selected = await assetService.getSelectedAsset(assetType);
            return res.status(200).json({ success: true, data: selected });
          }

          default: {
            const errorResponse: ApiErrorResponse = {
              success: false,
              error: 'Invalid action',
              details: [{ field: 'action', message: `Action must be one of: list, selected` }]
            };
            return res.status(400).json(errorResponse);
          }
        }

      case 'POST':
        switch (action) {
          case 'create': {
            // Handle background creation (JSON only)
            if (assetType === 'background') {
const { name, style } = req.body as { name: string, style: string };
              const backgroundData = {
                name,
                style,
                isActive: true,
                isSelected: false
              } as const;
              
              const asset = await assetService.createAsset(assetType, backgroundData);
              return res.status(201).json({ success: true, data: asset });
            }
            
            // Handle frame and guide creation
            const { name, url } = req.body as { name: string, url: string };
            if (!name || !url) {
              const errorResponse: ApiErrorResponse = {
                success: false,
                error: 'Missing required fields',
                details: [
                  { field: 'name', message: 'Name is required' },
                  { field: 'url', message: 'URL is required' }
                ]
              };
              return res.status(400).json(errorResponse);
            }

            // Create the frame or guide with the provided URL
            const assetData = {
              name,
              url,
              isActive: true,
              isSelected: false
            } as const;
            
            const asset = await assetService.createAsset(assetType, assetData);
            return res.status(201).json({ success: true, data: asset });
          }

          case 'select': {
            const { id } = req.body as { id: string | null };
            await assetService.selectAsset(assetType, id);
            return res.status(200).json({ success: true });
          }

          case 'toggle': {
            const { id: toggleId } = req.body as { id: string };
            const toggleResult = await assetService.toggleAssetActive(assetType, toggleId);
            return res.status(200).json({ success: toggleResult });
          }

          default: {
            const errorResponse: ApiErrorResponse = {
              success: false,
              error: 'Invalid action',
              details: [{ field: 'action', message: `Action must be one of: create, select, toggle` }]
            };
            return res.status(400).json(errorResponse);
          }
        }

      case 'DELETE': {
        if (action !== 'delete') {
          const errorResponse: ApiErrorResponse = {
            success: false,
            error: 'Invalid action',
            details: [{ field: 'action', message: `Action must be 'delete' for DELETE method` }]
          };
          return res.status(400).json(errorResponse);
        }

        const { id } = req.query;
        const assetId = typeof id === 'string' ? id : (Array.isArray(id) ? id[0] : '');
        const deleteResult = await assetService.deleteAsset(assetType, assetId);
        return res.status(200).json({ success: deleteResult });
      }

      default: {
        const errorResponse: ApiErrorResponse = {
          success: false,
          error: 'Method not allowed',
          details: [{ field: 'method', message: `Method ${req.method} is not allowed. Use GET, POST, or DELETE.` }]
        };
        return res.status(405).json(errorResponse);
      }
    }
  } catch (error) {
    console.error('Asset API Error:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? [{ field: 'server', message: error.message }] : undefined
    };
    return res.status(500).json(errorResponse);
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
