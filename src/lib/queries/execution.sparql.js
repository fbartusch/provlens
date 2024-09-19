export const execution_query = `
  PREFIX provone: <http://purl.dataone.org/provone/2015/01/15/ontology#>
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX prov: <http://www.w3.org/ns/prov#>

  SELECT ?execution ?label ?startTime ?endTime
  WHERE {
    # Find all executions
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
`;
