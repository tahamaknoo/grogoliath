// Content template language for programmatic SEO. Two constructs:
//   {{varName}}        → variable substitution (keyword, modifier, service…)
//   [option | option]  → variation group; one option is picked per page using
//                        a deterministic seed (row index), so the same row
//                        always resolves the same way (reproducible).
//
// Example template:
//   "[Best | Top-Rated | Trusted] {{keyword}} in {{modifier}} | 24/7 Service"
//
// Resolved for row 3 with keyword=plumbing, modifier=Chicago:
//   "Trusted plumbing in Chicago | 24/7 Service"

const VAR_RE = /\{\{\s*([a-zA-Z_][\w]*)\s*\}\}/g;
const GROUP_RE = /\[([^\]]+)\]/g;

export function resolveTemplate(template, vars = {}, seed = 0) {
  if (!template) return '';
  // Substitute variables first
  let out = template.replace(VAR_RE, (_, name) => {
    const v = vars[name];
    return v == null ? '' : String(v);
  });
  // Pick from variation groups
  out = out.replace(GROUP_RE, (_, group) => {
    const opts = group.split('|').map(s => s.trim()).filter(Boolean);
    if (opts.length === 0) return '';
    return opts[Math.abs(seed) % opts.length];
  });
  // Collapse double spaces caused by empty variables
  return out.replace(/[ \t]{2,}/g, ' ').trim();
}

// What variables a template uses (for the helper-chip UI).
export function listVariables(template) {
  if (!template) return [];
  const set = new Set();
  let m;
  const re = new RegExp(VAR_RE.source, 'g');
  while ((m = re.exec(template)) !== null) set.add(m[1]);
  return Array.from(set);
}

// A simple variation-strength heuristic. More groups + more variables =
// stronger lexical variety across pages, which Google's quality algos prefer.
export function variationScore(...templates) {
  let groupOptions = 0;  // total options across all [A|B|C] groups
  let groups = 0;        // count of groups
  let variables = 0;     // total {{var}} occurrences
  for (const t of templates) {
    if (!t) continue;
    let m;
    const gRe = new RegExp(GROUP_RE.source, 'g');
    while ((m = gRe.exec(t)) !== null) {
      const opts = m[1].split('|').map(s => s.trim()).filter(Boolean);
      if (opts.length > 1) { groups += 1; groupOptions += opts.length; }
    }
    const vRe = new RegExp(VAR_RE.source, 'g');
    while (vRe.exec(t) !== null) variables += 1;
  }
  const raw = groupOptions + variables * 2;
  let label, tone, percent;
  if (raw >= 14)      { label = 'Strong variation';   tone = 'good';  percent = Math.min(100, 70 + (raw - 14) * 3); }
  else if (raw >= 7)  { label = 'Moderate variation'; tone = 'ok';    percent = 40 + (raw - 7) * 4; }
  else if (raw >= 1)  { label = 'Weak variation';     tone = 'warn';  percent = 10 + raw * 4; }
  else                { label = 'No variation yet';   tone = 'bad';   percent = 0; }
  return { raw, groups, variables, label, tone, percent };
}
