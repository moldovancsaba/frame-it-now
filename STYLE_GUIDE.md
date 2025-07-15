# Project Style Guidelines and Technical Documentation

## Styling Rules

### 1. Global Style Rule
- ALL styles MUST be defined in `/styles/globals.css`
- NO inline styles allowed in components
- NO CSS modules or other style files permitted
- NO competing style declarations allowed

### 2. Technology Stack
- TailwindCSS for utility-first styling
- CSS layers for proper style organization:
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```
- Next.js for page and component rendering

### 3. Background Implementation
```css
/* In globals.css */
body {
  background: #2A7B9B;
  background: linear-gradient(315deg, 
    rgba(42, 123, 155, 1) 0%, 
    rgba(87, 199, 133, 1) 50%, 
    rgba(237, 221, 83, 1) 100%
  );
}
```

### 4. Button Implementation
- Fixed dimensions: 140px width, 44px height
- White background with consistent styling
- Centered text with no wrapping
- Single row layout in portrait mode
- Fixed right-side column in landscape mode

```css
/* Button base style */
.btn {
  @apply bg-white text-gray-900 rounded-lg;
  @apply font-semibold text-base;
  @apply hover:bg-gray-100 transition-all duration-200;
  @apply flex items-center justify-center;
  width: 140px;
  height: 44px;
  padding: 0 1rem;
  white-space: nowrap;
}

/* Button container layout */
.button-container {
  @apply flex flex-row items-center justify-center;
  @apply gap-4;
  @apply w-full;
  max-width: calc(4 * 140px + 3 * 1rem);
}

/* Landscape mode button positioning */
@media (orientation: landscape) {
  .button-container {
    @apply fixed right-6 top-1/2;
    @apply flex-col m-0 p-0;
    transform: translateY(-50%);
    width: 140px;
    z-index: 50;
  }

  .camera-container {
    padding-right: calc(140px + 2rem);
  }
}
```

### 5. Container Layout
- Camera container centers content vertically and horizontally
- Preview container maintains aspect ratio with max width
- All containers use viewport-relative sizing
- Proper spacing maintained in both orientations

```css
.camera-container {
  @apply flex flex-col items-center justify-center;
  @apply min-h-screen w-full;
  @apply gap-4;
  padding: 5%;
}

.preview-container {
  @apply relative overflow-hidden;
  @apply flex items-center justify-center;
  @apply w-full max-w-[min(90vh,640px)] aspect-square mx-auto;
  @apply rounded-lg;
}
```

### 6. Z-Index Layering
Clear z-index hierarchy for proper element stacking:
1. Video preview: z-index: 10
2. Face guide overlay: z-index: 20
3. Photo frame: z-index: 30
4. Buttons (landscape): z-index: 50
5. Loading overlay: z-index: 50

### 7. Best Practices
1. Use @layer for style organization
2. Maintain single source of truth for styles
3. Use Tailwind utilities when possible
4. Define custom styles only when needed
5. Keep consistent spacing and sizing
6. Use relative units for responsiveness

### 8. Button Order
Standard button order in interface:
1. Download
2. Share
3. New Photo
4. View Online

### 9. Responsive Design
- Portrait: Buttons in single row at bottom
- Landscape: Buttons in column on right side
- Container adjusts size and position based on buttons
- Maintains consistent spacing and alignment

### 10. Performance Considerations
- Use hardware acceleration for transforms
- Minimize style recalculations
- Optimize button container reflow
- Proper will-change hints for animations

