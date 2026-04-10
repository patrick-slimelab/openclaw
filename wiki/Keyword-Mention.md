# Matrix Keyword Mention Feature

## Overview

The Matrix channel plugin supports keyword-based message triggers, allowing the bot to respond to messages containing specific keywords without requiring an explicit @mention.

## Use Case

In designated rooms (like #scoob-admin or #the-doghouse), users can trigger the bot by typing specific keywords (e.g., "scoob" or "hound") rather than needing to @mention the bot.

## Configuration

Add to your `openclaw.json`:

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

| Option           | Type     | Default                                    | Description                                  |
| ---------------- | -------- | ------------------------------------------ | -------------------------------------------- |
| `requireMention` | boolean  | true                                       | Require @mention for bot response            |
| `keywordMention` | boolean  | false                                      | Allow keywords to bypass mention requirement |
| `keywords`       | string[] | ["\\bscoob[a-z]*\\b", "\\b[a-z]*hound\\b"] | Regex patterns to match                      |

## Default Keywords

The default keyword patterns are:

- `/\bscoob[a-z]*\b/i` - Matches: `scoob`, `scooby`, `scoober`, `scoobs`, etc.
- `/\b[a-z]*hound\b/i` - Matches: `hound`, `shithound`, `dirthound`, etc.

## How It Works

1. When a message is received in a configured room
2. The bot checks if the message contains any matching keyword pattern
3. If a keyword matches and `keywordMention: true`, the mention requirement is bypassed
4. The bot processes the message and responds
5. Messages without keywords still require @mention (if `requireMention: true`)

## Example Configuration

### Basic Setup

```json
{
  "channels": {
    "matrix": {
      "rooms": {
        "!CUqbYAuoIkIOvzXnCA:cclub.cs.wmich.edu": {
          "requireMention": true,
          "keywordMention": true
        }
      }
    }
  }
}
```

### Custom Keywords

```json
{
  "channels": {
    "matrix": {
      "rooms": {
        "!myroom:server": {
          "requireMention": true,
          "keywordMention": true,
          "keywords": ["botname", "help", "status"]
        }
      }
    }
  }
}
```

## Troubleshooting

### Bot not responding to keywords

1. Check if `keywordMention: true` is set in room config
2. Verify room ID is correct (use `openclaw matrix rooms` to list rooms)
3. Check logs: `openclaw logs --follow`
4. Ensure the keyword pattern matches your message

### Bot responding to all messages

- Make sure `requireMention: true` is set
- Do not set `requireMention: false` unless you want the bot to respond to everything

## Security Considerations

- Use specific keyword patterns to avoid false triggers
- Test patterns before deploying to public rooms
- Be aware that keyword patterns are public in configuration

## Related Documentation

- [AGENTS.md](../AGENTS.md) - Development workflow
- [Matrix Channel Configuration](./Matrix-Channel-Config.md) - Full Matrix plugin documentation

## Version History

- v2026.4.9 - Initial keyword mention support
