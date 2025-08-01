# PWA Icon Generator

A modern, intuitive web application for generating Progressive Web Application (PWA) icons with customizable colors, sizes, and styles. Built with Next.js 15, TypeScript, and Tailwind CSS.

![PWA Icon Generator](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)

## Features

- **Icon Library**: Browse and search through 1000+ icons from Lucide
- **Real-time Preview**: See your icon changes instantly with multiple size variations
- **Customization Options**:
  - Background color with color picker
  - Icon color with color picker
  - Border radius adjustment (0-50%)
  - Icon size control (30-90%)
- **Complete PWA Package**: Generates all required icon sizes and formats:
  - Favicons (16x16, 32x32, favicon.ico)
  - Apple Touch Icon (180x180)
  - Android Chrome icons (192x192, 512x512)
  - PWA icons (48x48 to 1024x1024)
  - Maskable icons for Android
  - manifest.json file
  - HTML meta tags
- **One-click Download**: Get all icons in a convenient ZIP file

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/zlatanpham/mvp-icon-generator.git
cd mvp-icon-generator
```

2. Install dependencies:

```bash
pnpm install
```

3. Run the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Select an Icon**: Browse or search for an icon from the library
2. **Customize**:
   - Adjust background and icon colors using the color pickers
   - Set border radius with the slider (0% for square, 50% for circle)
   - Control icon size relative to the background
3. **Preview**: See real-time updates in multiple sizes
4. **Download**: Click "Download" to get a ZIP file with all icon sizes

## Generated Files

The download package includes:

- **Icons**: All standard PWA icon sizes from 16x16 to 1024x1024
- **favicon.ico**: Multi-resolution favicon
- **manifest.json**: Pre-configured web app manifest
- **html-meta-tags.txt**: Ready-to-use HTML meta tags
- **README.txt**: Installation instructions

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: [Vitest](https://vitest.dev/)

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests
- `pnpm add:ui` - Add new shadcn/ui components

### Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
│   └── ui/          # shadcn/ui components
├── lib/             # Utility functions
│   ├── utils.ts     # Helper functions
│   └── icon-generator.ts  # Icon generation logic
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Credits

Made with ❤️ by [Zlatan Pham](https://github.com/zlatanpham)

## License

This project is open source and available under the [MIT License](LICENSE).
