import { writable, derived } from 'svelte/store';

/* Fuseki connection settings/status */

export const fuseki_url = writable('https://127.0.0.1');
export const fuseki_dataset = writable('ds');
export const dataset_gsp_endpoint = writable('data');
export const dataset_sparql_endpoint = writable('sparql');
export const fuseki_user = writable('user1');
export const fuseki_pw = writable('pw');

export const isFusekiConnected = writable(false);

/* derived URLS */

export const ping_url = derived([fuseki_url], ([$fuseki_url]) => `${$fuseki_url}/$/ping`);

export const gsp_url = derived(
	[fuseki_url, fuseki_dataset, dataset_gsp_endpoint],
	([$fuseki_url, $fuseki_dataset, $dataset_gsp_endpoint]) =>
		`${$fuseki_url}/${$fuseki_dataset}/${$dataset_gsp_endpoint}`
);

export const sparql_url = derived(
	[fuseki_url, fuseki_dataset, dataset_sparql_endpoint],
	([$fuseki_url, $fuseki_dataset, $dataset_sparql_endpoint]) =>
		`${$fuseki_url}/${$fuseki_dataset}/${$dataset_sparql_endpoint}`
);

export const basicAuth = derived([fuseki_user, fuseki_pw], ([$fuseki_user, $fuseki_pw]) =>
	btoa(`${$fuseki_user}:${$fuseki_pw}`)
);

/* Trace filter placeholders */
export const filterWorkflowPlaceholder = writable('Filter by Workflow');
export const filterVersionPlaceholder = writable('Filter by Version');
export const filterStartPlaceholder = writable('Filter by Start Time');
export const filterEndPlaceholder = writable('Filter by End Time');
export const filterLabelPlaceholder = writable('Filter by Label');

/* Trace filter values */
export const filterWorkflowValue = writable('');
export const filterVersionValue = writable('');
export const filterStartValue = writable('');
export const filterEndValue = writable('');
export const filterLabelValue = writable('');