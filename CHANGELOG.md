# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [6.0.0] - 2025-07-17

### Breaking Changes
- Complete rewrite of frame aspect ratio handling system
- New camera preview implementation for better frame alignment
- Changed photo capture mechanism to maintain frame proportions

### Added
- Automatic frame aspect ratio detection and preservation
- Enhanced preview system that maintains frame proportions
- Improved photo capture system that respects frame dimensions
- Better landscape mode responsiveness

### Fixed
- Frame alignment with camera preview
- Photo capture now maintains correct aspect ratio
- Debug background artifacts removed
- Preview container sizing issues
- Frame positioning in landscape mode

### Migration Guide
Custom frame implementations may need to be updated to work with the new aspect ratio system. Ensure all custom frames properly specify their dimensions.

### Added
- Full aspect ratio preservation throughout the camera and photo flow
- Frame aspect ratio is now properly detected and maintained

### Fixed
- Camera preview and captured photo now maintain consistent sizing
- Frame alignment issues with the video feed
- Removed debug background that was showing behind photos
- Landscape mode now properly maintains frame dimensions

## [5.2.1] - 2025-07-16

### Fixed
- Frame visibility in preview mode
- Frame selection improvements

## [5.2.0] - 2025-07-15

### Added
- Initial frame selection interface
- Camera preview functionality
- Basic photo capture and frame overlay
