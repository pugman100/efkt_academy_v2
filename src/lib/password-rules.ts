// Password rules, safe to import in client components (no bcrypt).

/** Rules shown next to the new-password field (reset / change password). */
export const PASSWORD_RULES = [
  { key: 'len', label: 'Minst 10 tegn', test: (p: string) => p.length >= 10 },
  { key: 'case', label: 'Både store og små bokstaver', test: (p: string) => /[a-zæøå]/.test(p) && /[A-ZÆØÅ]/.test(p) },
  { key: 'num', label: 'Minst ett tall', test: (p: string) => /[0-9]/.test(p) },
  { key: 'sym', label: 'Minst ett spesialtegn', test: (p: string) => /[^A-Za-zÆØÅæøå0-9]/.test(p) },
];

export function passwordRules(pw: string) {
  return PASSWORD_RULES.map((r) => ({ key: r.key, label: r.label, ok: r.test(pw) }));
}

export function passwordOk(pw: string): boolean {
  return PASSWORD_RULES.every((r) => r.test(pw));
}
