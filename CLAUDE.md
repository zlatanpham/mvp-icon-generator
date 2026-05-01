# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Instant Icon is a Next.js 15 web app for designing and exporting Progressive Web App (PWA) icon sets. Users design an icon in the browser (background, foreground, color, font, pattern, grain) and export a ZIP with every standard size, splash screens, a `manifest.json`, and ready-to-paste HTML meta tags. Projects are persisted locally and can be exported/imported as JSON.

## Commands

### Development

- `pnpm dev` - Run development server with Turbopack at http://localhost:3000
- `pnpm build` - Build production application
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests with Vitest
- `pnpm add:ui` - Add new shadcn/ui components

### Testing

- `pnpm test` - Run all tests
- `pnpm test src/app/page.test.tsx` - Run specific test file

## Architecture

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with CSS variables
- **UI Components**: shadcn/ui (New York style) - ready to add components
- **Testing**: Vitest with React Testing Library
- **Package Manager**: pnpm

### Project Structure

- `/src/app` - Next.js App Router pages
  - `page.tsx` - Simple home page
  - `layout.tsx` - Root layout
  - `globals.css` - Global styles and Tailwind directives
- `/src/components` - React components
  - `ui/` - shadcn/ui components (added as needed)
- `/src/lib` - Utility functions
  - `utils.ts` - cn() helper for className merging

### Key Patterns

- **Studio shell**: The app is a single page (`src/app/page.tsx`) composed of `Topbar`, `Sidebar`, `Canvas`, and `Properties` panels.
- **State**: `ProjectsProvider` (in `src/lib/studio/projects.ts`) owns the project list and persists to localStorage; `DesignProvider` (in `src/lib/studio/design.ts`) reads/writes the current project's design through it.
- **Component Library**: shadcn/ui (New York style); add new primitives via `pnpm add:ui [component]`.
- **Type Safety**: Strict TypeScript configuration.
- **Testing**: Vitest with jsdom environment and React Testing Library.
- **Path Aliases**: `@/*` maps to `./src/*`.

### Development Guidelines

- Use shadcn/ui components via `pnpm add:ui [component]` rather than hand-rolling primitives.
- Follow Next.js App Router conventions.
- Write tests for new features.
