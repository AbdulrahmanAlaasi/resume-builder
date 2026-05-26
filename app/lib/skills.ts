export const SKILL_LABELS = ['Technical Skills', 'Soft Skills'] as const;

export function stripSkillLabel(text: string, label: string) {
  const clean = text.trim();
  if (!clean.toLowerCase().startsWith(label.toLowerCase())) return text;
  return clean.slice(label.length).replace(/^[:\s-]+/, '');
}

export function applySkillLabel(label: string, value: string) {
  const clean = value.trim();
  return clean ? `${label} ${clean}` : label;
}

export function splitSkillLabel(text: string) {
  const clean = text.trim();
  const label = SKILL_LABELS.find((item) => clean.toLowerCase().startsWith(item.toLowerCase()));
  if (!label) return null;
  const value = stripSkillLabel(clean, label);
  return value ? { label, value } : null;
}

export function hasSkillContent(text: string) {
  const clean = text.trim();
  if (!clean) return false;
  return SKILL_LABELS.every((label) => clean.toLowerCase() !== label.toLowerCase());
}
