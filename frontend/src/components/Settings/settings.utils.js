export function formatDate(d) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function getExpiryLabel(validUntil) {
  const diff = new Date(validUntil).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const days = Math.ceil(diff / 86400000);
  if (days === 1) return "Expires tomorrow";
  if (days < 7) return `Expires in ${days}d`;
  return `Expires ${formatDate(new Date(validUntil))}`;
}

export const ROLE_IDS = { owner: 1, admin: 2, member: 3, guest: 4 };

export const ASSIGNABLE_ROLES = [
  { id: 2, label: "Admin" },
  { id: 3, label: "Member" },
];

export function roleBadgeVariant(name) {
  if (name === "owner") return "default";
  if (name === "admin") return "secondary";
  return "outline";
}
