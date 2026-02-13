import type { Skill } from "@mariozechner/pi-coding-agent";

export function formatSkillsForQwen(skills: Skill[]): string {
  if (skills.length === 0) {
    return "";
  }

  const lines = [
    "## Available Skills",
    "You have access to the following specialized skills. Each skill contains a SKILL.md file with specific instructions.",
    "",
  ];

  for (const skill of skills) {
    lines.push(`### ${skill.name}`);
    if (skill.description) {
      lines.push(`${skill.description.trim()}`);
    }
    lines.push(`Location: ${skill.filePath}`);
    lines.push("");
  }

  lines.push("To use a skill, read its SKILL.md file using the `read` tool.");
  return lines.join("\n");
}
