const crypto = require('crypto');

function pointId(docId, chunkIndex) {
  const raw = crypto.createHash('sha1').update(`${docId}|${chunkIndex}`).digest('hex');
  return [
    raw.slice(0, 8),
    raw.slice(8, 12),
    '4' + raw.slice(13, 16),
    ((parseInt(raw.slice(16, 17), 16) & 0x3) | 0x8).toString(16) + raw.slice(17, 20),
    raw.slice(20, 32),
  ].join('-');
}

const item = $json;
const points = (item.chunks || []).map(chunk => ({
  id: pointId(item.doc_id, chunk.chunk_index),
  vector: chunk.embedding,
  payload: {
    chunk_text: chunk.chunk_text,
    doc_id: item.doc_id,
    doc_name: item.name,
    breadcrumbs: item.breadcrumbs,
    chunk_index: chunk.chunk_index,
    chunk_total: chunk.chunk_total,
    updated_at: item.updated_at,
    source: item.source || 'demo',
  },
}));

return {
  json: {
    doc_id: item.doc_id,
    name: item.name,
    points,
  },
};
