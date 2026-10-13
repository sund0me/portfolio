return $input.all().map((emb, i) => {
  const original = $('Chunker').itemMatching(i).json;
  return {
    json: {
      ...original,
      embedding: emb.json.data?.[0]?.embedding,
    },
  };
});
