<script>
	import { page } from '$app/stores'; // Import the page store
	import { onMount } from 'svelte';
	import { sparql_url } from '../../../store';
	import { basicAuth } from '../../../store';
	import { subgraphTemplate } from '$lib/queries/subgraph.sparql.njk';

	import nunjucks from 'nunjucks';
	nunjucks.configure({ autoescape: true });

	let serverResponse = ''; // Variable to hold the server's response
	let responseText = '';
	let hasError = false;

	const handleConnect = async (query) => {
		console.log('handleConnect with query:', query);

		try {
			// Reset error state and response text
			hasError = false;
			responseText = 'Catch data...';

			// Send the request using fetch
			const response = await fetch($sparql_url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded', // SPARQL usually uses this MIME type
					Authorization: `Basic ${$basicAuth}`, // Include Basic Authentication header
					Accept: 'text/turtle' // Expecting JSON response
				},
				body: new URLSearchParams({
					query: query
				})
			});

			if (response.ok) {
				// Parse the JSON response
				const data = await response.text();
				serverResponse = data;
				console.log('Server response:', serverResponse);
			} else {
				console.error('SPARQL query failed:', response.statusText);
				throw new Error(`HTTP error! Status: ${response.status}`);
			}
		} catch (error) {
			console.error('Error:', error);
			hasError = true;
			serverResponse = `Fetching data failed.\nEndpoint URL: ${sparql_url}\nError message: ${error.message}\nPossible reasons: Wrong URL, Dataset, Endpoint, Username, or Password.`;
		}
	};

	// Automatically run the function when the component is mounted
	onMount(async () => {
		const executionId = $page.params.id;
		const query = nunjucks.renderString(subgraphTemplate, { executionId });
		handleConnect(query);
	});
</script>

<div>
	<h1>Execution Page</h1>
	<p>Execution ID: {$page.params.id}</p>

	<!-- Textarea displaying RDF data -->
	<textarea readonly bind:value={serverResponse}></textarea>
</div>

<style>
	textarea {
		width: 100%;
		height: 800px;
		padding: 10px;
		font-family: monospace;
		background-color: #f0f0f0;
		border: 1px solid #ccc;
	}
</style>
