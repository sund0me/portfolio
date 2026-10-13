const byDocId = new Map();

for (const { json } of $input.all()) {
  if (!json.doc_id || !json.embedding) continue;
  if (!byDocId.has(json.doc_id)) {
    byDocId.set(json.doc_id, {
      doc_id: json.doc_id,
      name: json.name,
      breadcrumbs: json.breadcrumbs,
      updated_at: json.updated_at,
      source: json.source,
      chunks: [],
    });
  }
  byDocId.get(json.doc_id).chunks.push({
    chunk_text: json.chunk_text,
    chunk_index: json.chunk_index,
    chunk_total: json.chunk_total,
    embedding: json.embedding,
  });
}

for (const doc of byDocId.values()) {
  doc.chunks.sort((a, b) => a.chunk_index - b.chunk_index);
}

return Array.from(byDocId.values()).map(json => ({ json }));
