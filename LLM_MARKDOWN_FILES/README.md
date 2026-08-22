# LLM Markdown Files

Persistent instruction files for different coding agents.

| Tool | Global instruction file | Repo instruction file |
| --- | --- | --- |
| Claude Code | `~/.claude/CLAUDE.md` | `CLAUDE.md` |
| Codex | `~/.codex/AGENTS.md` | `AGENTS.md` |
| Grok Build | `~/.grok/AGENTS.md` | `AGENTS.md` |
| Gemini CLI | `~/.gemini/GEMINI.md` | `GEMINI.md` |

Each subdirectory contains the file name expected by that tool. Keep the
contents aligned when changing shared agent instructions. Each of the files point to the global AGENTS.md. So place each of the sub directories in it's relavent place (i.e. the claude/CLAUDE.md goes to ~/.claude/CLAUDE.md). Then the AGENTS.md that is at the root (same place as this README) goes to ~/coding/AGENTS.md.

The only additional thing that might need to be added is explicit permissions for each LLM to read the AGENTS.md file without asking - if you want that, that is :p.
