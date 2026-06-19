export default function splitInitials(name: string): string {
  if (!name?.trim()) return "?";

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) return parts[0][0].toUpperCase();

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
