import { writable, derived } from 'svelte/store';

export const fuseki_url = writable('https://127.0.0.1');
export const fuseki_dataset = writable('ds');
export const dataset_gsp_endpoint = writable('data');
export const dataset_sparql_endpoint = writable('sparql');
export const fuseki_user = writable('user1');
export const fuseki_pw = writable('pw');

    // URLs
	// Make URLs Reactive? With $: 
	//let ping_url = `${$fuseki_url}/$/ping`;
	//let gsp_url = `${$fuseki_url}/${$fuseki_dataset}/${$dataset_gsp_endpoint}`;
	//let sparql_url = `${$fuseki_url}/${$fuseki_dataset}/${$dataset_sparql_endpoint}`;
    // Create Basic Authorization header by encoding username and password to Base64
	//const basicAuth = btoa(`${$fuseki_user}:${$fuseki_pw}`); // Base64 encode username:password

export const ping_url = derived(
    [fuseki_url],
    ([$fuseki_url]) => `${$fuseki_url}/$/ping`
  );
  
export const gsp_url = derived(
    [fuseki_url, fuseki_dataset, dataset_gsp_endpoint],
    ([$fuseki_url, $fuseki_dataset, $dataset_gsp_endpoint]) => `${$fuseki_url}/${$fuseki_dataset}/${$dataset_gsp_endpoint}`
  );

export const sparql_url = derived(
    [fuseki_url, fuseki_dataset, dataset_sparql_endpoint],
    ([$fuseki_url, $fuseki_dataset, $dataset_sparql_endpoint]) => `${$fuseki_url}/${$fuseki_dataset}/${$dataset_sparql_endpoint}`
  );

export const basicAuth = derived(
    [fuseki_user, fuseki_pw],
    ([$fuseki_user, $fuseki_pw]) => btoa(`${$fuseki_user}:${$fuseki_pw}`)
  );

