# AGENTS.md - Coding Agent Guidelines

## Project Overview

OpenCode Project Manager is a CLI tool for managing OpenCode projects. It's built with TypeScript and runs on Node.js runtime.

## Important Notes
- `.env` file is already configured. **DO NOT read or modify .env**
- **Never commit .env files** - Already configured, don't modify
- **Use --data-path for testing** - Don't use production database
- 我已经在 `tests/fixtures/opencode` 中设置了 debug data  你可以通过 --data-path 直接调试。
- **Cascade deletes** - Database schema has CASCADE on foreign keys
- **No comments in production code** - Keep code self-documenting

## Development & Debug
```bash
# Install dependencies
pnpm install

# Run the CLI in development (using tsx for direct TypeScript execution)
pnpm run dev <command>
pnpm run dev --help

# Build the project
pnpm run build

# Use debug data with --data-path flag
pnpm run dev --data-path tests/fixtures/opencode list

# Run tests
pnpm test

# Run tests in watch mode
pnpm run test:watch
```

## Project Structure

```
opencode-project-manager/
├── index.ts              # CLI entry point
├── src/
│   ├── commands/         # CLI command handlers
│   │   ├── list.ts       # List projects command
│   │   └── remove.ts     # Remove project command
│   ├── storage/          # Database schemas
│   │   └── schema.ts     # Drizzle ORM table definitions
│   ├── config.ts         # Configuration management
│   └── db.ts             # Database connection
├── tests/                # Test files
│   ├── unit/             # Unit tests
│   └── fixtures/         # Test fixtures and helpers
├── dist/                 # Built output
└── .local/               # Debug data
```

## Testing
- Tests use isolated temporary databases
- Each test gets a fresh copy of `tests/fixtures/opencode` data
- Database connections are reset between tests using `resetDb()`

## Dependencies

**Core Dependencies:**
- `commander` - CLI framework
- `drizzle-orm` - Type-safe ORM
- `zod` - Runtime validation
- `chalk` - Terminal colors
- `cli-table3` - Table formatting
- `xdg-basedir` - Cross-platform config paths
- `better-sqlite3` - SQLite database driver

**Dev Dependencies:**
- `@types/node` - TypeScript types for Node.js
- `@types/better-sqlite3` - TypeScript types for better-sqlite3
- `typescript` - TypeScript compiler
- `tsup` - TypeScript bundler
- `tsx` - TypeScript execution engine for development
- `vitest` - Test framework

## Publishing

The package is published to npm and can be used via npx:

```bash
npx opencode-project@latest <command>
```
