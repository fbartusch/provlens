export const subgraph_query = `
  PREFIX provone: <http://purl.org/provone#>
  PREFIX prov: <http://www.w3.org/ns/prov#>

  # Replace <http://example.org/execution/123> with your specific execution IRI
  SELECT DISTINCT ?subject ?p ?o
  WHERE {
    {
      # Find triples involving the specific execution
      {
        <exa:6a828145-05a4-4543-a89e-c0c469c4619b> ?p ?o .
      }
      UNION
      # Find subjects of provone:wasPartOf that involve the specific execution
      {
        ?subject <provone:wasPartOf> <exa:6a828145-05a4-4543-a89e-c0c469c4619b> .
        ?subject ?p ?o .
      }
      UNION
      # Find all triples where subjects related to provone:wasPartOf are involved
      {
        ?s ?p ?o .
        FILTER (?s IN (
          SELECT DISTINCT ?subject WHERE {
            ?subject <provone:wasPartOf> <exa:6a828145-05a4-4543-a89e-c0c469c4619b> .
          }
        ))
      }
  }
`;