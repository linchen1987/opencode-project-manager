# OpenCode Project Manager

A powerful CLI tool for managing OpenCode projects. Easily list, inspect, and remove projects with a beautiful terminal interface.

## Features

- 📋 **List Projects** - View all your OpenCode projects in a beautifully formatted table
- 🗑️ **Remove Projects** - Safely delete projects and all associated data with cascade deletion

## Installation

### Using npx (Recommended)

No installation required! Run directly with npx:

```bash
npx opencode-project@latest --help
```

### Global Installation

Install globally to use anywhere:

```bash
npm install -g opencode-project
opencode-project --help

# or with pnpm
pnpm add -g opencode-project
opencode-project --help
```

## Usage

### List All Projects

View all your OpenCode projects:

```bash
opencode-project list

# or use the short alias
opencode-project ls

# with custom data path
opencode-project list --data-path /path/to/opencode/data

# with verbose output
opencode-project list --verbose
```

### Remove Projects

Remove one or more projects and all associated data:

```bash
# remove a single project
opencode-project remove <project-id>

# remove multiple projects
opencode-project remove <id1> <id2> <id3>

# use short alias
opencode-project rm <project-id>

# other aliases
opencode-project delete <project-id>
opencode-project del <project-id>
```

⚠️ **Warning**: This operation is irreversible. All associated data will be permanently deleted.

### Global Options

```bash
opencode-project [options] [command]

Options:
  -V, --version           output the version number
  -d, --data-path <path>  Path to opencode data directory or database file
  -v, --verbose           Enable verbose output
  -h, --help              display help for command
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/linchen1987/opencode-project-manager/issues) on GitHub.

---

Made with ❤️ for the OpenCode community
