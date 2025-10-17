  // validators.js

export const patterns = {
  // Title: no leading/trailing spaces and collapse doubles (we'll trim/normalize in code)
  title: /^\S(?:.*\S)?$/,
  // Duration numeric (minutes) - integer or decimal up to 2 decimals
  duration: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
  // Date YYYY-MM-DD
  date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
  // Tag: letters, spaces or hyphens (single words or multi)
  tag: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/
};

// advanced pattern example: duplicate word back-reference
export const duplicateWordRe = /\b(\w+)\s+\1\b/i;

export function normalizeTitle(t){
  if (!t) return '';
  // collapse multiple spaces, trim
  return t.replace(/\s+/g,' ').trim();
}

export function validateRecord(rec){
  const errors = [];
  const title = normalizeTitle(rec.title || '');
  if (!patterns.title.test(title)) errors.push('Title invalid (no leading/trailing spaces).');
  if (!patterns.date.test(rec.date || '')) errors.push('Date must be YYYY-MM-DD.');
  if (!patterns.duration.test(String(rec.duration || ''))) errors.push('Duration invalid (whole minutes or decimal up to 2).');
  if (!patterns.tag.test(rec.tag || '')) errors.push('Tag must be letters, spaces or hyphens.');
  // advanced: warn about duplicate word in title
  if (duplicateWordRe.test(title)) errors.push('Title has duplicate adjacent words.');
  return errors;
}
