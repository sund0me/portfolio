const { readFileSync } = require('node:fs');
const { join } = require('node:path');

function runNode(name, items, original = items) {
  const code = readFileSync(join(__dirname, 'nodes', name), 'utf8');
  return new Function('$input', '$json', '$', 'require', code)(
    { all: () => items }, items[0]?.json,
    () => ({ itemMatching: index => original[index] }), require,
  );
}

function pipeline(documents) {
  const chunks = runNode('chunker.js', documents.map(json => ({ json })));
  const originals = chunks.map(({ json }) => ({ json: {
    ...json, name: json.title, breadcrumbs: ['Demo'], source: 'demo',
    updated_at: '2000-01-01',
    chunk_total: chunks.filter(item => item.json.doc_id === json.doc_id).length,
  } }));
  const vectors = originals.map(() => ({ json: { data: [{ embedding: [0.1, 0.2, 0.3] }] } }));
  const attached = runNode('attach-embedding.js', vectors, originals);
  const grouped = runNode('aggregate.js', attached);
  return grouped.map(item => runNode('build-points.js', [item]).json);
}

module.exports = { pipeline, runNode };

if (require.main === module) {
  const documents = [
    { id: 'demo-document-a', title: 'Getting started', category: 'demo',
      content: '## Welcome\nThis is a synthetic knowledge-base document.\n## Next step\nRead the demo instructions.' },
    { id: 'demo-document-b', title: 'Troubleshooting', category: 'demo',
      content: '## Troubleshooting\nCheck the sample input and run the local tests.' },
  ];
  console.log(JSON.stringify(pipeline(documents), null, 2));
}
