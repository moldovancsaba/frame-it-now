This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Camera Preview

The application implements a natural, user-friendly camera preview experience:

### Front Camera Behavior
- Preview is mirrored horizontally, matching how users expect selfie cameras to work
- Creates an intuitive "mirror-like" experience when composing shots
- Captured photos maintain correct, unmirrored orientation
- Ensures text and asymmetric objects appear properly in final images

This implementation follows standard mobile camera patterns, providing a familiar and professional user experience while maintaining high-quality output.

## Learn More

To learn more about Next.js

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Project Documentation

- [Architecture](./ARCHITECTURE.md) - System design and components
- [Release Notes](./RELEASE_NOTES.md) - Change history and versions
- [Roadmap](./ROADMAP.md) - Future development plans
- [Task List](./TASKLIST.md) - Active and upcoming tasks
- [Learnings](./LEARNINGS.md) - Development insights and solutions

## TypeScript Support

This project uses TypeScript for enhanced type safety and developer experience. Key features:
- Full TypeScript support across all components
- Strict type checking enabled
- Modern TypeScript/React patterns

## Deployment (v3.0.0)

Follow these steps to deploy the application:

1. Build Verification
   ```bash
   npm run build
   ```
   Ensure no build errors are present

2. Development Testing
   ```bash
   npm run dev
   ```
   Verify all features in development environment

3. Production Deployment
   ```bash
   npm run build
   vercel --prod
   ```

For detailed deployment information, check our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).
