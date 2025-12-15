const KEYWORDS = ['employee', 'staff', 'provider', 'assigned'];

const isPlainObject = (val) => val && typeof val === 'object' && !Array.isArray(val);

const valueMatches = (key, val) => {
  if (typeof val !== 'string') return null;
  const lowerKey = (key || '').toLowerCase();
  const trimmed = val.trim();
  if (!trimmed) return null;
  if (KEYWORDS.some((k) => lowerKey.includes(k))) {
    return trimmed;
  }
  return null;
};

export const resolveEmployeeName = (booking, fallback) => {
  const seen = new Set();
  const stack = [{ key: '', value: booking, depth: 0 }];

  while (stack.length) {
    const { key, value, depth } = stack.pop();
    if (value === null || value === undefined) continue;

    // Direct string match on keyworded key
    const match = valueMatches(key, value);
    if (match) return match;

    if (typeof value === 'string') continue;

    // Traverse objects/arrays up to a reasonable depth
    if (depth > 3) continue;

    if (Array.isArray(value)) {
      value.forEach((v, idx) => stack.push({ key: `${key}[${idx}]`, value: v, depth: depth + 1 }));
    } else if (isPlainObject(value)) {
      if (seen.has(value)) continue;
      seen.add(value);
      Object.entries(value).forEach(([k, v]) => {
        // Prefer name-ish keys even if not keyworded
        if (typeof v === 'string' && k && k.toLowerCase().includes('name') && v.trim()) {
          stack.push({ key: `${key}.${k}`, value: v, depth: depth + 1 });
        } else {
          stack.push({ key: k, value: v, depth: depth + 1 });
        }
      });
    }
  }

  return fallback;
};
