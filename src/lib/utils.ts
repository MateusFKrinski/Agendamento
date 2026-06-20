export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) return parts[0][0].toUpperCase();

  const first = parts[0];
  const last = parts[parts.length - 1];

  return (first[0] + last[0]).toUpperCase();
}
