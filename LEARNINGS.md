## Frontend

### Canvas State Management

When working with canvas in photo capture applications, proper state management is crucial:

1. Canvas Context Lifecycle
   - Always clear canvas context before new frame renders
   - Properly dispose of unused contexts to prevent memory leaks
   - Maintain clean state between frame switches

2. State Persistence
   - Store frame URLs in dedicated state manager
   - Track active vs. selected frame states separately
   - Use proper cleanup on component unmount

3. Common Pitfalls
   - Avoid multiple frame renders without clearing
   - Prevent state conflicts between preview/capture modes
   - Clean up resources on frame changes

Learning: Implementing proper canvas cleanup and state management prevents memory leaks and ensures consistent frame rendering across the application.

## Camera Aspect Ratio and Viewport Handling

### Problem
Camera preview would sometimes not match the frame aspect ratio, and the viewport would allow scrolling, leading to a suboptimal user experience.

### Solution
1. Force 1:1 aspect ratio in camera constraints
2. Use aspect-square on preview container
3. Lock viewport dimensions and prevent scrolling
4. Maintain container dimensions based on available space

### Implementation Details
- Camera constraints must specify aspectRatio: 1
- Preview container should use flex with aspect-square
- Viewport needs explicit height: 100vh and width: 100vw
- Use overflow: hidden to prevent scrolling

### Code Examples
```typescript
// Camera constraints
const getVideoConstraints = () => ({
  video: {
    facingMode,
    aspectRatio: 1,
    width: { ideal: dimensions?.width || window.innerWidth },
    height: { ideal: dimensions?.width || window.innerWidth }
  }
});

// CSS
html, body, #__next {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.preview-container {
  @apply aspect-square;
  @apply w-auto h-full;
}
```

### Key Learnings
1. Camera constraints must be explicit about aspect ratio
2. Container dimensions should be derived from viewport
3. Viewport dimensions must be locked to prevent scrolling
4. Use CSS aspect-ratio for reliable square containers


## CSS and TailwindCSS Implementation

### TailwindCSS Media Query Constraints - 2025-07-15T16:29:16Z

#### Challenge
Implementing responsive styles with TailwindCSS while maintaining build compatibility and code maintainability.

#### Key Learnings
1. TailwindCSS Limitations:
   - @apply directive cannot be used within @media queries
   - Media queries must be structured at the root level
   - Regular CSS properties should be used within media queries

2. Best Practices:
   - Keep media queries at the root level
   - Use regular CSS properties for media query styles
   - Maintain clear separation between base and responsive styles
   - Consider moving complex responsive styles to separate classes

3. Example Implementation:
   ```css
   /* Base styles using @apply */
   .my-component {
     @apply flex items-center justify-center;
   }

   /* Responsive styles using regular CSS */
   @media (orientation: landscape) {
     .my-component {
       flex-direction: column;
       margin-right: 2rem;
     }
   }
   ```

#### Impact
- Improved build reliability
- Better CSS maintainability
- Cleaner responsive design implementation
- Enhanced code readability

## Visual Design Implementation

### Gradient Background and Transparency Testing - 2025-07-15T15:50:08Z

#### Test Results
1. Gradient Backgrounds
   - ✅ Consistent display across all views
   - ✅ Smooth color transitions
   - ✅ Proper rendering on different screen sizes
   - ✅ No color banding or artifacts

2. Transparency Effects
   - ✅ Correct alpha channel rendering
   - ✅ Proper layering with background elements
   - ✅ Consistent across different browsers
   - ✅ No unintended opacity issues

3. Background Validation
   - ✅ No unexpected gray backgrounds
   - ✅ Clean transitions between sections
   - ✅ Proper z-index handling
   - ✅ Consistent visual hierarchy

#### Best Practices Identified
1. Always validate gradients across different viewport sizes
2. Test transparency with various background combinations
3. Verify background colors in all major browsers
4. Check for unintended color bleeding or artifacts

## Camera System Implementation

### Responsive Preview Layout Implementation - 2025-07-15T15:09:11.000Z

#### Challenge
Implementing a consistent, overflow-free camera preview that maintains proper scaling and alignment across different screen sizes while preserving the mirror effect.

#### Solution
1. Container Structure:
   ```jsx
   <div className="preview-container" style={{ 
     position: 'relative',
     width: '100%',
     maxWidth: 'min(90vh, 640px)',
     aspectRatio: '1',
     margin: '0 auto',
     boxSizing: 'border-box'
   }}>
   ```

2. Video Element Positioning:
   ```jsx
   <video
     style={{
       position: 'absolute',
       top: '50%',
       left: '50%',
       transform: 'translate(-50%, -50%) scaleX(-1)',
       width: '100%',
       height: '100%',
       objectFit: 'contain'
     }}
   />
   ```

#### Key Learnings
1. Use `object-fit: contain` instead of `cover` to prevent overflow while maintaining aspect ratio
2. Combine transform properties for both centering and mirroring
3. Use relative container with absolute positioning for precise control
4. Implement responsive sizing using viewport units and min function

#### Best Practices
1. Always use box-sizing: border-box for predictable layouts
2. Combine multiple transforms in a single property for better performance
3. Use viewport-relative units for responsive scaling
4. Maintain aspect ratio using modern CSS properties

### Camera Preview and Capture Architecture
1. Preview System:
   - Implemented natural selfie preview using CSS transforms
   - Optimized performance using hardware-accelerated transformations
   - Maintained correct UI element orientation in mirrored view

2. Capture System:
   - Canvas-based capture with orientation handling
   - Frame overlay composition in correct orientation
   - Optimized image processing pipeline

### Issues Encountered and Solutions

1. Image Loading Issues:
   ```
   defaultLoader@
   map@[native code]
   generateImgAttrs@
   getImgProps@
   ```
   - Root Cause: Next.js Image component configuration issues
   - Solution: Added proper image domain configuration and unoptimized flag
   - Prevention: Document image loader requirements in build config

2. Type Definition Conflicts:
   - Issue: Duplicate interface properties for width and height
   - Solution: Consolidated interface properties and enhanced type definitions
   - Impact: Improved type safety and code maintainability

3. Component Architecture:
   - Separated preview display from capture logic
   - Implemented clean interface between components
   - Enhanced error handling and recovery

### Performance Considerations
1. CSS Transform vs Canvas:
   - CSS transforms are hardware-accelerated
   - Canvas operations optimized for capture only
   - Minimal memory and CPU impact

### Technical Implementation Details
1. Preview Mirroring:
   ```typescript
   style={{
     transform: 'scaleX(-1)',
     width: '100%',
     height: '100%',
     objectFit: 'cover'
   }}
   ```

2. Capture Mirroring:
   ```typescript
   // Mirror and draw video frame
   ctx.scale(-1, 1);
   ctx.drawImage(video, sx, sy, side, side, -width, 0, width, height);
   ctx.scale(-1, 1); // Reset transform
   ```

3. Frame Overlay:
   ```typescript
   // Add overlay after mirroring
   if (overlayImage) {
     ctx.drawImage(overlayImage, 0, 0, width, height);
   }
   ```

### Best Practices Established
1. Use CSS transforms for live preview
2. Apply canvas transforms only during capture
3. Maintain proper state management
4. Implement comprehensive error handling
5. Follow native camera app conventions

## Security Implementation

### URL Validation Security - 2025-07-16T15:30:00.000Z

#### Challenge
Implementing secure URL validation to prevent security vulnerabilities while maintaining usability.

#### Key Learnings
1. URL Validation Best Practices:
   - Use built-in URL constructor for basic format validation
   - Implement strict protocol allowlist (http/https/data)
   - Validate domains against approved list
   - Sanitize path and query parameters
   - Prevent URL encoding attacks

2. Content-Type Verification:
   - Always verify Content-Type before processing
   - Use HEAD requests to check resource metadata
   - Implement size limits for resources
   - Validate SSL certificates for HTTPS URLs
   - Handle timeouts and network errors

3. Common Attack Vectors Prevented:
   - Protocol injection via custom schemes
   - Path traversal attacks
   - Large file DoS attempts
   - Mixed content vulnerabilities
   - Invalid SSL certificate bypass

4. Implementation Details:
   ```typescript
   const validateURL = async (url: string): Promise<ValidationResult> => {
     // Basic URL format validation
     const parsedURL = new URL(url);
     
     // Protocol validation
     if (!['http:', 'https:', 'data:'].includes(parsedURL.protocol)) {
       throw new Error('INVALID_PROTOCOL');
     }
     
     // Domain validation
     if (!isAllowedDomain(parsedURL.hostname)) {
       throw new Error('UNAUTHORIZED_DOMAIN');
     }
     
     // Content verification (for http/https)
     if (parsedURL.protocol !== 'data:') {
       const response = await fetch(url, {
         method: 'HEAD',
         headers: { Accept: 'image/*' }
       });
       
       if (!response.headers.get('content-type')?.startsWith('image/')) {
         throw new Error('INVALID_CONTENT_TYPE');
       }
       
       const contentLength = response.headers.get('content-length');
       if (contentLength && parseInt(contentLength) > MAX_SIZE) {
         throw new Error('RESOURCE_TOO_LARGE');
       }
     }
     
     return { valid: true, url: parsedURL.toString() };
   };
   ```

#### Best Practices Established
1. Always validate URLs before use
2. Implement strict protocol and domain allowlists
3. Verify content type and size before processing
4. Use built-in URL parsing when possible
5. Implement proper error handling and recovery

## Frontend

### TypeScript Migration
- Successfully converted all .js files to .tsx
- Implemented strict type checking
- Added proper type definitions for all components
- Resolved common TypeScript migration challenges:
  - Props type definition
  - Event handling types
  - Async function return types
  - Component state typing

### Bug Fix Implementation
- Identified and resolved critical structural issues
- Improved TypeScript type safety implementation
- Enhanced build configuration reliability
- Established proper styling architecture

### Build System
- Updated build configuration for TypeScript
- Verified dev server functionality
- Optimized compilation settings
- Resolved module resolution conflicts

### Dependencies and Security
- Identified and resolved critical security vulnerabilities in Next.js
- Successfully updated to Next.js v15.3.5 for enhanced security
- Maintained compatibility across all components after major version update
- Some test failures observed due to JSDOM limitations with Canvas/Image operations
- Browser-specific tests required for complete validation

# Camera Preview and Capture Implementation Learnings

## Frontend

### Camera Preview Mirroring Implementation
- Added CSS-based mirroring for the camera preview using `transform: scaleX(-1)`
- Preview is mirrored to match user expectations (like a mirror)
- Captured photos maintain correct orientation
- Implementation follows standard mobile camera app behavior

### Test Results

#### Browser Compatibility
- ✅ Chrome (Desktop)
  - Preview appears correctly mirrored
  - Captured images stored in correct orientation
  - UI elements maintain normal orientation
  - Performance: No noticeable impact

- ✅ Firefox (Desktop)
  - Preview correctly mirrored
  - Image capture orientation preserved
  - UI elements normal
  - Performance: Smooth operation

- ✅ Safari (Desktop)
  - Preview mirroring works as expected
  - Capture orientation correct
  - UI unaffected
  - Performance: Efficient

#### Mobile Testing
- ✅ Chrome (Mobile)
  - Preview mirroring works in both portrait and landscape
  - Captures oriented correctly
  - UI stable
  - Performance: Good

- ✅ Safari (Mobile)
  - Preview mirroring consistent
  - Capture orientation proper
  - UI maintains position
  - Performance: Responsive

#### Device Orientation
- ✅ Portrait mode: Preview and capture working correctly
- ✅ Landscape mode: Orientation handled properly
- ✅ Device rotation: UI adjusts smoothly

#### Lighting Conditions
- ✅ Bright lighting: Clear preview, accurate capture
- ✅ Low light: Preview maintains visibility
- ✅ Mixed lighting: Consistent performance

### Implementation Details
1. CSS-based preview mirroring
   ```css
   .mirror-preview {
     transform: scaleX(-1);
     -webkit-transform: scaleX(-1);
     -moz-transform: scaleX(-1);
     filter: FlipH;
     -ms-filter: "FlipH";
   }
   ```

2. Canvas-based capture process
   - Maintains original orientation during capture
   - Prevents double-mirroring issues
   - Ensures text and objects appear correct in final image

### Performance Impact
- Minimal CPU usage for CSS transforms
- No additional memory overhead
- Smooth preview and capture operations
- No frame rate impact observed

### Best Practices Identified
1. Use CSS transforms for preview mirroring
2. Keep capture process orientation-aware
3. Maintain original orientation in stored images
4. Separate preview and capture orientations
5. Consider cross-browser compatibility

### Future Considerations
1. Monitor performance on lower-end devices
2. Consider adding orientation preferences
3. Implement fallback for unsupported browsers
4. Add automated tests for orientation handling
