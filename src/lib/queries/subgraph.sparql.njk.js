export const subgraphTemplate = `
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX exa:     <http://example.com/>
PREFIX foaf:    <http://xmlns.com/foaf/0.1/>
PREFIX prov:    <http://www.w3.org/ns/prov#>
PREFIX provone: <http://purl.dataone.org/provone/2015/01/15/ontology#>
PREFIX schema:  <https://schema.org/>
PREFIX scoro:   <http://purl.org/spar/scoro/>
PREFIX xsd:     <http://www.w3.org/2001/XMLSchema#>

CONSTRUCT {
  ?s ?p ?o .
}
WHERE {
  GRAPH <http://example/trace_{{ executionId }}> {
    ?s ?p ?o .
  }
}
`;
