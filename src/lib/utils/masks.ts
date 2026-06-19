export function maskCPF(value?: string | null): string {
  return (value ?? "")
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function maskPhone(value?: string | null): string {
  const digits = (value ?? "").replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
}

export function maskZipCode(value?: string | null): string {
  return (value ?? "").replace(/\D/g, "").replace(/(\d{5})(\d{1,3})/, "$1-$2");
}

export function maskPlate(value?: string | null): string {
  const clean = (value ?? "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const slice = clean.slice(0, 7);

  if (slice.length <= 3) return slice;

  return slice.slice(0, 3) + "-" + slice.slice(3);
}

export function maskCNPJ(value?: string | null): string {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}
