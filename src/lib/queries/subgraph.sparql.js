export const subgraph_query = `
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX exa:     <http://example.com/>
PREFIX foaf:    <http://xmlns.com/foaf/0.1/>
PREFIX prov:    <http://www.w3.org/ns/prov#>
PREFIX provone: <http://purl.dataone.org/provone/2015/01/15/ontology#>
PREFIX schema:  <https://schema.org/>
PREFIX scoro:   <http://purl.org/spar/scoro/>
PREFIX xsd:     <http://www.w3.org/2001/XMLSchema#>

CONSTRUCT {
  <exa:0167e674-f78a-4992-90ee-ba3a53e55ecb> ?predicate ?object .
  ?subExecution ?subPredicate ?subObject .
  ?user <prov:wasAssociatedWith> ?execution .
  ?user <prov:wasAssociatedWith> ?subExecution .
  ?user ?userPredicate ?userObject .
  ?data ?dataPredicate ?dataObject .
  ?generatedData <prov:wasGeneratedBy> ?subExecution .
  ?generatedData ?dataPredicate2 ?dataObject2 .
  ?program ?programPredicate ?programObject
}
WHERE {
  <exa:0167e674-f78a-4992-90ee-ba3a53e55ecb> ?predicate ?object .
  
  OPTIONAL {
    # Retrieve all data that was used or generated by this execution
    <exa:0167e674-f78a-4992-90ee-ba3a53e55ecb> <prov:used> ?data .
    ?data ?dataPredicate ?dataObject .
  }
  
  OPTIONAL {
    # Identify executions that are part of the primary execution
    ?subExecution <provone:wasPartOf> <exa:0167e674-f78a-4992-90ee-ba3a53e55ecb> .

    # Retrieve all triples where these subExecutions are subjects
    ?subExecution ?subPredicate ?subObject .
    
    OPTIONAL {
      # Retrieve all data that was used by this subexecution
      ?subExecution <prov:used> ?data .
      ?data ?dataPredicate ?dataObject .
    }
    
    OPTIONAL {
      # Retrieve all data that was generated by this subexecution
      ?generatedData <prov:wasGeneratedBy> ?subExecution .
      ?generatedData ?dataPredicate2 ?dataObject2 .
    }

      OPTIONAL {
      # Retrieve all Programs related to this subexecution
      ?generatedData <prov:wasGeneratedBy> ?subExecution .
      ?generatedData ?dataPredicate2 ?dataObject2 .
    }
  }
  
  OPTIONAL {
    # Get the user associated with the main execution and any sub-executions
    ?user <prov:wasAssociatedWith> ?execution.
    ?user ?userPredicate ?userObject . 
    FILTER (?userPredicate != <prov:wasAssociatedWith>)
  }
}
`;
