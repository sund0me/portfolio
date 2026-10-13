const MAX_CHARS = 2000; // ~500 токенов кириллицы (4 символа/токен)
const MIN_CHARS = 400;  // мелкие секции мерджим со следующей
const OVERLAP   = 200;  // overlap при нарезке крупных секций

const items  = $input.all();
const chunks = [];

for (const item of items) {
  const { id, title, category, content } = item.json;

  const sections = content.split(/(?=^#{2,3} )/m).filter(s => s.trim());

  let pending    = '';
  let chunkIndex = 0;

  const flush = (text) => {
    const t = text.trim();
    if (!t) return;
    chunks.push({
      json: {
        doc_id:      id,
        title,
        category,
        chunk_index: chunkIndex++,
        chunk_text:  t,
      }
    });
  };

  for (const section of sections) {
    if (section.length > MAX_CHARS) {
      if (pending) { flush(pending); pending = ''; }

      let pos = 0;
      while (pos < section.length) {
        flush(section.slice(pos, pos + MAX_CHARS));
        pos += MAX_CHARS - OVERLAP;
      }
    } else if (pending.length + section.length + 2 <= MAX_CHARS) {
      pending += (pending ? '\n\n' : '') + section;
    } else {
      if (pending.length >= MIN_CHARS) {
        flush(pending);
        pending = section;
      } else {
        pending += (pending ? '\n\n' : '') + section;
      }
    }
  }

  if (pending) flush(pending);
}

return chunks;
