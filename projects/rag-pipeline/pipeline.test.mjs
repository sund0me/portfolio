import { test } from 'node:test';
import assert from 'node:assert/strict';
import demo from './demo.cjs';

test('pipeline keeps documents separate and preserves metadata through embedding', () => {
  const documents = ['a', 'b'].map(id => ({
    id: `demo-${id}`, title: `Document ${id}`, category: 'demo',
    content: `## Example\nSynthetic content ${id}.`,
  }));
  const first = demo.pipeline(documents);
  assert.equal(first.length, 2);
  assert.deepEqual(first, demo.pipeline(documents));
  assert.notEqual(first[0].points[0].id, first[1].points[0].id);
  for (const document of first) {
    const point = document.points[0];
    assert.equal(point.payload.doc_id, document.doc_id);
    assert.match(point.id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    assert.deepEqual(point.vector, [0.1, 0.2, 0.3]);
    assert.equal(point.payload.source, 'demo');
  }
});

test('long sections produce ordered overlapping chunks', () => {
  const content = '## Large section\n' + 'sample '.repeat(800);
  const [document] = demo.pipeline([{ id: 'demo-long', title: 'Long demo', category: 'demo', content }]);
  assert.ok(document.points.length > 2);
  const [first, second] = document.points;
  assert.equal(first.payload.chunk_text.slice(-200), second.payload.chunk_text.slice(0, 200));
  document.points.forEach((point, index) => {
    assert.equal(point.payload.chunk_index, index);
    assert.equal(point.payload.chunk_total, document.points.length);
    assert.ok(point.payload.chunk_text.length <= 2000);
  });
});

test('empty input and documents without content produce no points', () => {
  assert.deepEqual(demo.pipeline([]), []);
  assert.deepEqual(demo.pipeline([{ id: 'demo-empty', title: 'Empty', category: 'demo', content: '' }]), []);
});
