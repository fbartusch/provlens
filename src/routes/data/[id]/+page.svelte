<script>
	import { page } from '$app/stores'; // Import the page store
	import { onMount } from 'svelte';
	import { subgraph_query } from '$lib/queries/subgraph.sparql';
	// Subscribing to the page store to get the URL parameters
	$: console.log($page.params.id); // Debug

	import { sparql_url } from '../../../store';
	import { basicAuth } from '../../../store';

	let serverResponse = ''; // Variable to hold the server's response
	let responseText = '';
	let hasError = false;
	const handleConnect = async () => {
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
					query: subgraph_query
				})
			});

			if (response.ok) {
				// Parse the JSON response
				const data = await response.text(); // Use .text() for RDF/XML, .json() for JSON-LD, etc.
				serverResponse = data; //JSON.stringify(data, null, 2);  // Pretty print JSON response
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
	onMount(() => {
		handleConnect(); // Run the function without a button click
	});
</script>

<div>
	<h1>Execution Page</h1>
	<p>Execution ID: {$page.params.id}</p>
	<!-- Display the ID -->

	<!-- Button to trigger the fetch request -->
	<!--<button on:click={handleConnect}>Fetch Data</button>-->

	<!-- Textarea to display the server response -->
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
