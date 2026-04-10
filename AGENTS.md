# Agent Workflow Guide - OpenClaw Matrix Plugin

This document defines best practices for contributing to the Matrix channel plugin.

## Core Principles

1. **Never patch compiled JS** - Always edit TypeScript source files
2. **Never hardcode values** - Use configuration via openclaw.json
3. **Never commit secrets** - Use environment variables or secret managers
4. **Document all changes** - Update wiki when modifying behavior
5. **Use good git hygiene** - Atomic commits, clear messages, proper branching

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout v2026.4.9 -b feature/descriptive-name
```

Branch from the release version Scoob is running (check `openclaw --version`).

### 2. Edit TypeScript Source

Files to modify:

- `extensions/matrix/src/config-schema.ts` - Add config options
- `extensions/matrix/src/matrix/monitor/handler.ts` - Implement features
- `extensions/matrix/src/` - Other source files as needed

### 3. Test Locally

```bash
pnpm build
pnpm test
```

### 4. Commit Changes

```bash
git add extensions/matrix/src/
git commit -m "feat(matrix): add keywordMention config support

- Add keywordMention: boolean to room schema
- Add keywords: string[] for custom patterns
- Implement keyword bypass for mention requirement
- Patterns: \\bscoob[a-z]*\\b, \\b[a-z]*hound\\b

Closes #issue-number"
```

### 5. Update Documentation

- Update `AGENTS.md` if workflow changes
- Update `./wiki/` with feature documentation
- Link to relevant issues/PRs

### 6. Push and Deploy

```bash
git push origin feature/descriptive-name
```

## Configuration

The Matrix plugin supports room-level configuration:

```json
{
  "channels": {
    "matrix": {
      "rooms": {
        "!roomid:server": {
          "requireMention": true,
          "keywordMention": true,
          "keywords": ["scoob", "custom-pattern"]
        }
      }
    }
  }
}
```

### Options

- `requireMention` (boolean): Whether @mention is required (default: true)
- `keywordMention` (boolean): Allow keyword patterns to bypass mention requirement
- `keywords` (string[]): Custom regex patterns (default: `["\\bscoob[a-z]*\\b", "\\b[a-z]*hound\\b"]`)

## Building and Deploying

### Build Requirements

- Node.js 22.x
- pnpm 9.x
- Pin to OpenClaw version matching production

### Build Steps

```bash
# Ensure correct version
git checkout v2026.4.9

# Install dependencies
pnpm install

# Build
pnpm build

# Verify dist files created
ls -la dist/monitor-*.js
```

### Deploy to Production

**WARNING: Do NOT rsync local dist/ to production** - dependency versions may mismatch.

Instead:

1. Build from clean checkout of target version
2. Use `npm pack` or equivalent to create clean package
3. Deploy via package manager, not file copy

## Configuration Management

All behavior must be configurable via `openclaw.json`:

- No hardcoded room IDs
- No hardcoded user IDs
- No hardcoded regex patterns
- No hardcoded API keys or tokens

Values that MUST be configurable:

- Room IDs for special handling
- Mention regex patterns
- Keyword patterns
- API endpoints and keys

## Security

- Never commit `.env` files
- Never commit API keys
- Never commit recovery keys
- Use `buildSecretInputSchema()` for sensitive values
- Use environment variables for runtime secrets

## Documentation Updates

When adding features:

1. Update `./wiki/Feature-Name.md` with usage examples
2. Update `AGENTS.md` if workflow changes
3. Cross-link related documentation
4. Include configuration examples

## Testing Checklist

Before committing:

- [ ] TypeScript compiles without errors
- [ ] Config schema validates
- [ ] No hardcoded values in source
- [ ] Secrets not committed
- [ ] Documentation updated
- [ ] Commit message follows conventions
- [ ] Branch based on correct release version

## Git Hygiene

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation

## Version Compatibility

Always match the OpenClaw version running in production:

```bash
# Check production version
ssh donghouse "openclaw --version"

# Checkout matching tag
git checkout v2026.4.9
```

## Useful Commands

```bash
# Check for hardcoded values
grep -r "scoob\|hound" extensions/matrix/src/ | grep -v config-schema

# Validate TypeScript
pnpm tsc --noEmit

# Verify no secrets
grep -r "token\|key\|secret" extensions/matrix/src/ | grep -v Schema
```

## Questions?

- Check existing [GitHub Issues](https://github.com/openclaw/openclaw/issues)
- Review `./wiki/` documentation
- Ask in #scoobdev on Discord
