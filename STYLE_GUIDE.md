# Project Style Guidelines and Technical Documentation

## Styling Rules

### 1. Global Style Rule
- ALL styles MUST be defined in `/styles/globals.css`
- NO inline styles allowed in components
- NO CSS modules or other style files permitted
- NO competing style declarations allowed

### 2. Technology Stack
- TailwindCSS for utility-first styling
- Flexbox for button layout with wrapping
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
#### Flex Layout
- Portrait mode: Wrap to new rows when needed
- Landscape mode: Single column, no wrap
- No text overflow or cropping allowed
- Consistent button sizing

```css
/* Portrait mode flex */
.button-container {
  @apply w-full max-w-[640px] mx-auto;
  @apply flex flex-wrap justify-center items-center;
  @apply gap-4;
  padding: 0.5rem;
}

/* Landscape mode flex */
@media (orientation: landscape) {
  .button-container {
    @apply fixed right-6 top-1/2;
    @apply flex flex-col flex-nowrap;
    @apply m-0 p-2;
    transform: translateY(-50%);
    width: 160px;
    z-index: 50;
  }
}
```

#### Button Styling
```css
.btn {
  @apply bg-white text-gray-900 rounded-lg;
  @apply font-semibold text-base;
  @apply hover:bg-gray-100 transition-all duration-200;
  @apply flex items-center justify-center;
  min-width: 140px;
  height: 44px;
  padding: 0 1rem;
  white-space: nowrap;
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
4. Let buttons wrap naturally on overflow
5. Keep consistent spacing and sizing
6. Use relative units for responsiveness

### 8. Button Rules
1. Standard button order:
   - Download
   - Share
   - New Photo
   - View Online
2. Button sizing:
   - Minimum width: 140px
   - Fixed height: 44px
   - Full text visibility required
3. Button wrapping:
   - Portrait: Wrap to new rows when needed
   - Landscape: Single column, no wrap
4. Button spacing:
   - Gap between buttons: 1rem (16px)
   - Container padding: 0.5rem (8px)

### 9. Responsive Design
- Portrait: Buttons wrap to new rows if needed
- Landscape: Fixed width column on right side
- Container adjusts for button position
- Maintains consistent spacing and alignment

### 10. Performance Considerations
- Use Flexbox for optimal layout performance
- Hardware acceleration for transforms
- Minimize style recalculations
- Efficient button wrapping
- Proper will-change hints for animations

