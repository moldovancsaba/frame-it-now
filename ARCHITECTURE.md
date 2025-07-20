# Frame-It-Now Architecture

## Version 1.0.0

### Core Components

#### Camera Preview
Single-responsibility component that handles camera access and display:
- Located in `app/page.tsx`
- Uses native MediaDevices API
- Full-screen video preview
- Automatic resource cleanup

### Technical Stack
- Next.js 15.4.2
- React 18
- TypeScript
- Native Browser APIs
  - MediaDevices for camera access

### Application Structure
```
app/
├── layout.tsx   # Root layout with minimal styling
└── page.tsx     # Camera preview component
```

# Architecture Overview

## System Components

### Frontend (Next.js)
- **Pages**: Route-based React components
- **Components**: Reusable UI elements
- **Hooks**: Custom React hooks for shared logic
- **State**: Centralized state management
- **Utils**: Helper functions and utilities

### Key Features
- Server-side rendering with Next.js
- Type safety with TypeScript
- Modern React patterns and hooks
- Responsive design principles

## Component Structure
```
src/
├── pages/          # Next.js pages and API routes
├── components/     # Reusable UI components
├── hooks/         # Custom React hooks
├── utils/         # Helper functions
└── styles/        # Global styles and themes
```

## Data Flow
1. User interaction triggers component event
2. State updates handled by hooks
3. Components re-render with updated data
4. Server-side operations via API routes

## Dependencies
- Next.js 15.4.2 - Frontend framework
- React 18 - UI library
- TypeScript - Type system
- ESLint - Code quality

## Development Workflow
1. Local development (`npm run dev`)
2. Build verification (`npm run build`)
3. Production deployment (Vercel)
