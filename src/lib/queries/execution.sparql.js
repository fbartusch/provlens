export const execution_query = `
  PREFIX provone: <http://purl.dataone.org/provone/2015/01/15/ontology#>
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

  SELECT ?execution
  WHERE {
    ?execution a provone:Execution .
    ?execution <ex:launchDir> ?launchDir
  }
`;