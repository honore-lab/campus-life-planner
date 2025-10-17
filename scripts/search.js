// search.js
export function compileRegex(input, flags='i') {
  if (!input) return null;
  try {
    return new RegExp(input, flags);
  } catch (e) {
    return null;
  }
}

function escapeHtml(s){
  return s.replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

export function highlight(text, re){
  if (!re) return escapeHtml(String(text));
  // We will replace matches with <mark> while escaping the rest
  const parts = [];
  let lastIndex = 0;
  const str = String(text);
  let m;
  re = new RegExp(re.source, re.flags + (re.flags.indexOf('g') === -1 ? 'g' : ''));
  while ((m = re.exec(str)) !== null) {
    parts.push(escapeHtml(str.slice(lastIndex, m.index)));
    parts.push('<mark>' + escapeHtml(m[0]) + '</mark>');
    lastIndex = m.index + m[0].length;
    if (m.index === re.lastIndex) re.lastIndex++; // avoid infinite loop
  }
  parts.push(escapeHtml(str.slice(lastIndex)));
  return parts.join('');
}
