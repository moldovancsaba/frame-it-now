## Frame Overlay Rendering System

### Components

1. PhotoFrame Component
   - Manages frame overlay positioning and scaling
   - Handles frame URL state management
   - Ensures consistent rendering across preview and capture modes

2. Canvas Integration
   - Uses HTML5 Canvas for frame composition
   - Maintains proper z-index layering
   - Handles frame scaling and positioning calculations

### State Management

- Frame URL states:
  - Selected: Current frame URL in memory
  - Active: Frame being rendered on canvas
  - Preview: Frame shown in thumbnail selection

### Rendering Pipeline

1. Frame Loading
   - Validate frame URL
   - Pre-load image for performance
   - Handle loading errors gracefully

2. Canvas Operations
   - Create canvas context
   - Apply frame overlay with proper positioning
   - Handle canvas state cleanup

3. Frame Composition
   - Calculate proper scaling factors
   - Position frame relative to photo/preview
   - Apply any necessary transformations

# System Architecture

### Camera System Implementation

#### Camera Initialization Flow
The camera system implements a robust initialization process with retry capabilities:

1. **Initial Permission Check**
   - Check existing camera permissions
   - Request permissions if not already granted
   - Handle permission denials gracefully

2. **Device Detection**
   - Enumerate available camera devices
   - Select optimal device based on constraints
   - Handle device unavailability scenarios

3. **Stream Initialization**
   - Configure stream with optimal settings
   - Implement automatic retry mechanism
   - Handle initialization failures

4. **State Synchronization**
   - Update UI to reflect current state
   - Maintain consistent error states
   - Track initialization progress

#### State Management Approach
- Implements Redux-style state management
- Uses immutable state updates
- Maintains single source of truth
- Provides predictable state transitions

#### Error Handling Strategy
1. **Categorized Error Types**
   - Permission errors
   - Device availability errors
   - Stream initialization errors
   - Runtime errors

2. **Recovery Mechanisms**
   - Automatic retry with backoff
   - User-triggered retry options
   - Graceful fallback states
   - Clear error messaging

3. **Error Persistence**
   - Logging of error states
   - Error context preservation
   - Recovery attempt tracking
   - Debug information capture

#### Camera State Transitions
The camera system follows a predictable state machine with the following transitions:

1. **Initial State**
   - `isInitializing`: false
   - `isReady`: false
   - `permission`: 'pending'
   - No stream or error present

2. **Initialization Phase**
   - `isInitializing`: true
   - `isReady`: false
   - `permission`: 'pending'
   - Previous stream/error state preserved

3. **Success State**
   - `isInitializing`: false
   - `isReady`: true
   - `permission`: 'granted'
   - `stream`: Active MediaStream
   - No error present

4. **Error States**
   - `isInitializing`: false
   - `isReady`: false
   - `permission`: Based on error type
     * 'denied' for permission errors
     * 'pending' for other errors
   - `error`: Specific error details
   - No stream present

5. **Cleanup State**
   - All tracks in stream are stopped
   - State is reset to initial values
   - Resources are properly released

Transitions occur through the following triggers:
- Component mount: Initial → Initializing → Success/Error
- Permission change: Any → Success/Error
- Retry after error: Error → Initial → Initializing
- Component unmount: Any → Cleanup

#### Camera Initialization States
The camera system implements a robust state management system for handling device initialization and permissions:

1. **Permission States**
   - Granted: User has explicitly allowed camera access
   - Denied: User has explicitly blocked camera access
   - Prompt: Permission has not been requested yet
   - Error: Permission system encountered an error

2. **Device States**
   - Available: Camera device is detected and ready
   - Not Found: No camera device is available
   - API Unsupported: Browser doesn't support camera API
   - Error: Device encountered a hardware/system error

3. **Initialization States**
   - Success: Camera stream successfully initialized
   - Retrying: Attempting to recover from a temporary error
   - Failed: Initialization failed after max retries
   - Error: Unrecoverable initialization error

4. **Error Recovery**
   - Automatic retry with exponential backoff
   - Max 3 retry attempts
   - User-triggered manual retry available
   - Persistent permission tracking

All states are managed through a dedicated CameraService class with error boundary integration.

## Service Directory Structure

### Core Services
- `/services/camera/`
  - CameraService: Main camera functionality handler
  - StreamManager: Manages video streams and states
  - ErrorHandler: Camera-specific error processing

- `/services/state/`
  - StateManager: Central state management service
  - EventBus: Cross-component communication

- `/services/utils/`
  - TypeGuards: TypeScript type checking utilities
  - Validators: Input and state validation

### Integration Points
1. **Camera System Integration**
   - Interfaces with browser's MediaDevices API
   - Connects with state management layer
   - Integrates with error boundary system

2. **Component Integration**
   - CameraComponent ↔ CameraService
   - ErrorBoundary ↔ ErrorHandler
   - StateManager ↔ All Components

3. **Cross-Service Communication**
   - Event-based messaging system
   - Type-safe service interfaces
   - Centralized state updates

### URL Validation Flow

1. **Input Validation Layer**
   - Basic URL format validation using TypeScript URL constructor
   - Custom protocol allowlist (http://, https://, data:)
   - Domain validation against approved list
   - Path and query parameter sanitization

2. **Content Verification**
   - HEAD request to verify resource existence
   - Content-Type validation against allowed types
   - Content-Length checks for size limits
   - SSL certificate validation for HTTPS URLs

3. **Error Categories**
   - Malformed URL format
   - Disallowed protocol
   - Unauthorized domain
   - Invalid content type
   - Resource size exceeded
   - Network/SSL errors

4. **Recovery Actions**
   - User notification with specific error details
   - Automatic redirect to HTTPS when available
   - Retry mechanism for temporary network issues
   - Fallback to default resource on validation failure

### Component Relationships
1. **UI Layer**
   - CameraComponent (Parent)
     ↳ PreviewComponent
     ↳ ControlsComponent
     ↳ OverlayComponent

2. **Service Layer**
   - CameraService (Core)
     ↳ StreamManager
     ↳ ErrorHandler
     ↳ StateManager
     ↳ URLValidator

3. **Utility Layer**
   - TypeGuards
   - Validators
   - ErrorBoundary

### Camera Preview Implementation

### Mirrored Preview Behavior
The camera preview implementation follows modern mobile camera UX patterns by applying mirroring selectively:

1. Preview Display
   - Front camera preview is mirrored horizontally
   - This matches users' expectations from selfie cameras
   - Creates natural "mirror-like" interaction during composition

2. Capture Processing
   - Captured images are NOT mirrored
   - Preserves real-world orientation of scene
   - Ensures text and asymmetric objects appear correctly

### Technical Implementation
The mirroring effect is achieved through CSS transforms on the preview element, while keeping the underlying video capture stream unmodified. This separation ensures:

1. Clean separation of concerns between display and capture logic
2. Optimal performance by avoiding unnecessary image processing
3. Straightforward testing and maintenance
4. Flexibility for future enhancements

### Key Components
- Preview Container: Manages the camera feed display and applies mirror transform
- Capture Handler: Processes raw camera data without mirroring
- Orientation Manager: Coordinates preview and capture orientations

### Design Decisions
1. Mirror Transform Application
   - Applied via CSS for performance
   - Only affects visual preview
   - No impact on captured image quality

2. Preview/Capture Separation
   - Maintains clear boundaries between display and data layers
   - Simplifies debugging and testing
   - Follows single responsibility principle

This architecture ensures a professional, maintainable implementation that delivers a polished user experience matching industry standards.

## TypeScript Implementation

### Overview
The codebase employs TypeScript to enhance type safety and code reliability. Following a strict type-checking policy, the TypeScript setup ensures robust component interactions and predictable data flows.

### Component Structure
- Components utilize the .tsx extension, aligning seamlessly with React's functional component paradigm.
- Reusable prop interfaces promote component consistency and reduce duplication.
- Function components implement React.FC typing, reinforcing type certainty.

### Key Components
- **CameraComponent**: Provides a professional-grade interface for camera operations, integrating overlays and photo capture.
- **ErrorBoundary**: Enhances resilience by intercepting and handling runtime errors, ensuring stability.
- **OverlayGuide** and **PhotoFrame**: Offer visual guidance and frame overlay capabilities, assisting users in taking optimal photos.

### Type Definitions
- Centralized in the /types directory, type definitions establish common interfaces and shared structures, supporting strong type enforcement.

### Error Handling Architecture
Error handling is implemented through a comprehensive system of specialized components and services:

#### CameraErrorBoundary
Extends the base **ErrorBoundary** to provide camera-specific error handling:
- Catches and processes camera-specific errors
- Integrates with error logging service
- Implements automatic error recovery strategies
- Provides fallback UI during error states

#### Error Types
The system handles specific camera error categories:
- `PERMISSION_DENIED`: Camera access permission issues
- `DEVICE_NOT_FOUND`: No available camera device
- `CONSTRAINT_ERROR`: Camera configuration constraints not met
- `INITIALIZATION_ERROR`: Camera setup failures
- `STREAM_ERROR`: Live stream interruptions

#### Error Recovery System
Implements sophisticated recovery strategies:
1. Permission Errors: Automatic permission re-request
2. Device Issues: Alternative camera detection
3. Constraint Violations: Fallback to lower quality settings
4. Initialization Failures: System reset and reinitialize
5. Stream Problems: Automatic stream restart

#### Error Logging Service
Provides standardized error tracking across the application:
```typescript
interface ErrorLog {
  timestamp: string;  // ISO 8601 format
  type: string;
  message: string;
  context: object;
}
```

#### Recovery Flow
1. Error Detection: CameraErrorBoundary catches the error
2. Logging: Error details are logged via ErrorLoggingService
3. Recovery Attempt: System attempts automatic recovery based on error type
4. State Update: UI is updated to reflect current error/recovery status

This comprehensive error handling system ensures robust operation and graceful recovery from various camera-related issues while maintaining a professional user experience.

