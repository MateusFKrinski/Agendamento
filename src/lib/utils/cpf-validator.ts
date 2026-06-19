export function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  const calc = (mod: number) => {
    const sum = digits
      .slice(0, mod - 1)
      .split("")
      .reduce((acc, d, i) => acc + Number(d) * (mod - i), 0);
    const rest = (sum * 10) % 11;
    return rest === 10 || rest === 11 ? 0 : rest;
  };

  return calc(10) === Number(digits[9]) && calc(11) === Number(digits[10]);
}
