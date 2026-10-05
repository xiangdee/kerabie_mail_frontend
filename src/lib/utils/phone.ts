// Phone-entry helpers shared by every "country code + national number" form.
// Country phonecodes come from the API as "+234", "+1-684" or bare "93", so
// everything compares on digits only.

interface HasPhoneCode {
  phonecode: string | null;
}

const digitsOf = (s: string) => s.replace(/\D/g, '');

/**
 * Handles what the user types into the national-number box. A leading "+"
 * means they typed (or pasted) a full international number: the longest
 * matching country code selects the country and is stripped from the field,
 * leaving only the national part. Without a match yet (e.g. "+2" mid-typing)
 * the "+" stays so the next keystroke can still resolve it.
 */
export function applyPhoneInput<C extends HasPhoneCode>(
  raw: string,
  countries: C[],
  current: C | null,
): { country: C | null; national: string } {
  if (!raw.trimStart().startsWith('+')) {
    return { country: current, national: raw.replace(/[^\d\s-]/g, '') };
  }

  const digits = digitsOf(raw);
  let best: C | null = null;
  let bestLen = 0;
  for (const c of countries) {
    const code = c.phonecode ? digitsOf(c.phonecode) : '';
    if (!code || !digits.startsWith(code)) continue;
    // Longer code wins (+1264 over +1); on a tie keep the current country
    // (+1 is shared by US/CA, so don't flip a user who already chose one).
    if (code.length > bestLen || (code.length === bestLen && c === current)) {
      best = c;
      bestLen = code.length;
    }
  }

  if (!best) return { country: current, national: `+${digits}` };
  return { country: best, national: digits.slice(bestLen) };
}

/** E.164 string for the backend. A still-"+"-prefixed field is already full international. */
export function buildPhone(country: HasPhoneCode | null, national: string): string {
  const digits = digitsOf(national);
  if (national.trimStart().startsWith('+')) return `+${digits}`;
  const code = country?.phonecode ? digitsOf(country.phonecode) : '';
  return `+${code}${digits.replace(/^0+/, '')}`;
}
