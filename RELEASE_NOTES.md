## [v4.0.0] — 2025-07-22T17:05:20.000Z

### Major Update
- Fixed container scaling and aspect ratio issues.
- Implemented ResponsiveScaler component for consistent display.
- Removed errors related to black rectangles resizing improperly.

### Technical Details
- Switched to fixed and absolute positioning for better layout control.
- Updated utility functions to ensure reliable scaling.

### Usage Changes
- Integrate ResponsiveScaler with content to handle aspect ratios.

### Breaking Changes
- Container and content must now respect new layout logic and structure.

## [v3.1.0] — 2024-03-20T15:30:00.000Z

### Added
- Responsive frame scaling system
- Dynamic viewport size handling
- CSS transform-based optimization

### Technical Details
- Implemented ResponsiveScaler component for frame size management
- Added viewport-based calculations for consistent display
- Optimized rendering using CSS transform scaling

### Usage Example
```jsx
<ResponsiveScaler>
  <Frame width={500} height={300} />
</ResponsiveScaler>
```

### Breaking Changes
- Frame components must now be wrapped in ResponsiveScaler
- Direct size manipulation via style props is deprecated
- Viewport changes now trigger automatic rescaling

## [v3.0.0] — 2025-07-21T16:20:00.000Z

### Major Changes
- Enhanced Fast Refresh reliability by converting anonymous functions to named functions
- Improved component lifecycle handling in CameraLayer
- Enhanced error handling and cleanup in media interactions
- Optimized performance with proper function definitions

### Technical Details
- Converted anonymous component functions to named exports
- Implemented proper cleanup patterns in useEffect hooks
- Enhanced error boundaries around media interactions
- Optimized component rendering lifecycle

## [v2.0.2] — 2025-07-21T16:16:33Z

### Changes
- Fixed camera preview display by adding required video element attributes
- Added horizontal mirroring for natural webcam view
- Ensured proper autoplay behavior with muted attribute

## [v2.0.1] — 2025-07-21T16:13:41Z

### Changes
- Added API endpoint for camera layer creation
- Successfully tested layer creation with proper type and order parameters
- Verified layer ID assignment and visibility controls

## [v2.0.0] — 2025-07-21

Major update: Added camera stream capability

### Changes
- Implemented camera layer with video streaming
- Ensured user permissions prompt for camera access
- Fixed video element initialization and playback issues
- Optimized loading and error states


## [v1.0.0] — 2025-07-20

Major update: Complete refactor to minimal camera preview functionality

### Changes
- Removed all unnecessary components and files
- Simplified to core camera preview functionality
- Optimized for full-screen display
- Improved resource cleanup and TypeScript types
- Removed all styling systems and unnecessary configurations

# Release Notes

## [0.2.0] — 2024-01-09T12:34:56.789Z

### Changes
- Simplified architecture for improved maintainability
- Removed redundant components and streamlined code structure
- Enhanced code organization and modularity
- Updated dependencies to latest stable versions
- Established clear documentation structure

### Technical Details
- Restructured component hierarchy
- Unified state management approach
- Improved file organization
- Updated Next.js to version 15.4.2
- Added comprehensive documentation files
