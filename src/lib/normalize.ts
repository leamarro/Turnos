export function normalizeInstagram(value?: string | null) {
  if (!value) return null;
  return value.replace("@", "").trim().toLowerCase();
}

export function normalizePhone(value?: string | null) {
  if (!value) return null;
  return value.replace(/\D/g, "");
}
