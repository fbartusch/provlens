export const execution_query = `
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX exa:     <http://example.com/>
PREFIX foaf:    <http://xmlns.com/foaf/0.1/>
PREFIX prov:    <http://www.w3.org/ns/prov#>
PREFIX provone: <http://purl.dataone.org/provone/2015/01/15/ontology#>
PREFIX schema:  <https://schema.org/>
PREFIX scoro:   <http://purl.org/spar/scoro/>
PREFIX xsd:     <http://www.w3.org/2001/XMLSchema#>

SELECT DISTINCT ?graph (STRAFTER(STR(?execution), ":") AS ?executionLocalName) ?label ?startTime ?endTime
WHERE {
  GRAPH ?graph {
    ?execution a <provone:Execution> .
    ?execution <prov:label> ?label .

    # Filter out those that are part of a provone:wasPartOf relationship
    FILTER NOT EXISTS { 
      ?execution <provone:wasPartOf> ?something .
    }
    
    # Optionally get the start time if it exists
    OPTIONAL { ?execution <prov:startedAtTime> ?startTime . }

    # Optionally get the end time if it exists
    OPTIONAL { ?execution <prov:endedAtTime> ?endTime . }
  }
}
`;
