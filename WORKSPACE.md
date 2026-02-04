# openclaw-workspace

This repo is a fork of `openclaw/openclaw` but exists to version-control *workspace prompt files*.

## Workspace templates

See `workspace/`:
- `AGENTS.md`
- `SOUL.md`
- `TOOLS.md`
- `IDENTITY.md`
- `USER.md`
- `HEARTBEAT.md`
- `BOOTSTRAP.md`

These are copied from upstream `docs/reference/templates/` (frontmatter intact).

## Branch model tuning

Create branches per model (example):
- `qwen3-coder-next-80b-a3b-f16`

…and tune the files under `workspace/` for that model.

Upstream updates can be pulled by merging/rebasing from upstream, then re-copying templates into `workspace/` if desired.
