# Contributing to OnePulse

Thank you for your interest in contributing to OnePulse! This guide will help you understand how to contribute effectively to the project.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Install dependencies** with `npm install`
4. **Create a new branch** for your feature/fix: `git checkout -b feature/your-feature-name`

## Development Setup

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Check code quality
npm run check

# Automatically fix code issues
npm run fix

# Type checking
npm run typecheck
```

## Code Standards

This project follows the **Ultracite** (Biome preset) code standards. Key principles:

### Style & Formatting

- **Automatic formatting**: Run `npm run fix` before committing
- **Type safety**: Always provide explicit types when enhancing clarity
- **Self-documenting code**: Write clear variable/function names, use JSDoc for complex logic
- **Accessibility**: Include ARIA labels, semantic HTML, and proper keyboard support

### Architecture Guidelines

#### Component Structure

- Use functional components with React 19+ patterns
- Leverage `use*` hooks for complex logic separation
- Place components in meaningful subdirectories
- Keep components focused on a single responsibility

#### Hooks

- Extract complex component logic into custom hooks
- Hook files should start with `use-` prefix
- Use `readonly` for props to prevent mutations
- Return explicit types from hooks

#### Error Handling

- Use the `handleError` function from `@/lib/error-handling`
- Provide user-friendly error messages via `ERROR_MESSAGES` constants
- Log errors to stderr for debugging
- Use try-catch in async operations

#### Validation

- Use validation utilities from `@/lib/validation`
- Always validate user input, especially addresses and numeric values
- Use type guards for runtime safety
- Never trust client-side data implicitly

### TypeScript

- Use strict mode (enforced in tsconfig)
- Prefer explicit over implicit types
- Use `unknown` instead of `any`
- Create meaningful type aliases for complex structures
- Export types alongside implementations

### React & JSX

- Use `"use client"` directive in client components
- Call hooks at the top level (never conditionally)
- Specify stable `key` props in lists (prefer unique IDs over indices)
- Use semantic HTML and ARIA attributes
- Memoize expensive computations with `useMemo`
- Prevent unnecessary renders with `React.memo`

### Performance

- Lazy load components using `React.lazy`
- Use images efficiently with `next/image`
- Avoid inline function definitions in props
- Batch state updates when possible
- Profile with React DevTools before optimizing

### Security

- **Never hardcode secrets** - use environment variables
- **Validate all inputs** - especially addresses and contract calls
- **Prevent XSS** - use `.textContent` instead of `.innerHTML`
- **Avoid eval()** and dynamic code execution
- **Use parameterized queries** for database operations
- **Add SSRF protection** when handling user-provided URLs

## Commit Guidelines

```bash
# Use descriptive, lowercase commit messages
git commit -m "feat: add validation utilities for ethereum addresses"
git commit -m "fix: improve error handling in gm-chain-card component"
git commit -m "docs: add JSDoc comments to countdown component"
git commit -m "refactor: extract chain logic into custom hook"
```

### Commit Message Format

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **refactor**: Code refactoring without feature/fix
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Dependency updates or tooling changes

## Pull Request Process

1. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** with:
   - Clear title describing the change
   - Detailed description of what changed and why
   - Reference any related issues (e.g., `Closes #123`)
   - Screenshots for UI changes

3. **Ensure all checks pass**:
   - ✅ Code formatting (`npm run check`)
   - ✅ TypeScript compilation (`npm run typecheck`)
   - ✅ No console errors or warnings

4. **Request review** from maintainers

5. **Respond to feedback** and make requested changes

## What to Contribute

### Great First Issues

- Improving error messages
- Adding JSDoc comments to existing functions
- Creating utility functions with tests
- Fixing accessibility issues
- Improving TypeScript types

### Feature Suggestions

- New validation utilities
- Enhanced error handling
- Performance optimizations
- Better component composition
- Additional configuration options

### Bug Fixes

- Document the bug clearly
- Include steps to reproduce if possible
- Link to any relevant error logs
- Test your fix thoroughly

## Testing

While we don't have formal tests yet, ensure:

1. **Manual testing** in development mode
2. **Cross-browser testing** (Chrome, Firefox, Safari)
3. **Mobile testing** (Farcaster Mini App context)
4. **Type checking** passes without errors
5. **Code quality** passes linting

## Documentation

- Add JSDoc comments to all exported functions
- Update README.md for significant changes
- Include inline comments for non-obvious logic
- Document any new environment variables
- Provide examples for complex features

## Project Structure Reference

```
app/               # Next.js app router and pages
├── api/           # API routes
├── layout.tsx     # Root layout
└── page.tsx       # Home page

components/        # React components
├── gm-chain-card/ # Per-chain GM functionality
├── providers/     # Context providers
└── ui/            # Reusable UI components

lib/               # Utilities and helpers
├── constants.ts   # Configuration constants
├── error-handling.ts # Error handling utilities
├── utils.ts       # General utilities
└── validation.ts  # Input validation

types/             # TypeScript type definitions
hooks/             # Custom React hooks
```

## Environment Variables

Required environment variables:
- None yet (configured via contracts and constants)

Optional for development:
- `NEXT_PUBLIC_*` - Exposed to browser

## Questions?

- Check existing issues and discussions
- Review the codebase and inline comments
- Reach out to maintainers on Farcaster (@pirosb3, @linda, @deodad)

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

---

Thank you for contributing to OnePulse! 🚀
