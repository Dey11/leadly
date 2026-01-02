# Leadly Frontend Design & Development Style Guide

To maintain a premium, consistent, and motion-rich user experience, all future enhancements and components must adhere to the following style rules.

## 🚀 Runtime & Package Management

- **Runtime**: [Bun](https://bun.sh) is the primary runtime for both frontend and backend.
- **Commands**:
  - `bun run dev`: Start development server.
  - `bun run build`: Create a production build.
  - `bun run lint:fix`: Format code (Prettier) and remove unused imports (`ts-remove-unused-imports`).
- **Standard**: Always use `bun` instead of `npm` or `yarn` for consistency.

## 🎨 Design System & Colors

The application uses a curated "Earthy-Modern" palette with vibrant accents.

### Core Colors (from `globals.css`)

- **Primary (Wine)**: `#773344` (used for headers and primary branding).
- **Secondary (Pale Dogwood)**: `#e3b5a4` (used for subtle accents and backgrounds).
- **Background (Linen)**: `#f5e9e2` (light mode base).
- **Foreground (Licorice)**: `#0b0014` (text color).
- **Accent (Indian Red)**: `#d44d5c` (primary action color, especially in dark mode).

### Dark Mode

- **Base**: `zinc-950` (#09090b) for background.
- **Primary Action**: Indian Red (#d44d5c).
- **Cards**: `zinc-900` (#18181b).

## 🧩 Component Architecture (Shadcn UI)

- **Official Components**: Use official Shadcn components located in `@/components/ui`.
- **Custom Components**: Build complex UI by composing Shadcn primitives.
- **Consistency Rules**:
  - **Inputs/Buttons**: Always use Shadcn `<Input />`, `<Button />`, and `<Label />`.
  - **Cards**: Use the full Card structure (`CardHeader`, `CardTitle`, `CardContent`, etc.).
  - **Modals**: Use `Dialog` for all modal-based interactions.

## 📐 Layout & Styling

- **Rounding**: Global radius is set to `0.625rem` (`var(--radius)`).
  - Use `rounded-xl` for big containers.
  - Use `rounded-lg` or `rounded-md` for sub-components.
- **Padding**:
  - Dashboard panels should use `p-6` for standard padding.
  - Section spacing should follow a consistent `gap-4` or `gap-6`.
- **Glassmorphism**: Use `bg-background/80backdrop-blur` for a premium, airy feel in sidebars and headers.

## 🖋️ Typography

- **Sans-serif (UI)**: Inter (Primary fallback for system UI).
- **Body Text**: DM Sans.
- **Headings/Display**: Outfit.
- **Monospaced**: JetBrains Mono.

## 🛠️ Coding Standards

- **Imports**: Unused imports are strictly forbidden. Use `bun run lint:fix` before every commit.
- **Formatting**:
  - `printWidth`: 80
  - `semi`: true
  - `singleQuote`: false (double quotes favored for JSX/TSX consistency).
  - `trailingComma`: "all"
- **Types**: All components should be strictly typed. Avoid `any` at all costs.

## ✨ Motion & Interactions

- **Framermotion**: Use `motion` for entrance animations (fade-in, slide-up).
- **Transitions**: Use smooth, subtle transitions for hover states (e.g., `transition-all duration-200`).
- **Interactive States**: Buttons and links must have clear `:hover` and `:active` states using `opacity` or subtle color shifts.
