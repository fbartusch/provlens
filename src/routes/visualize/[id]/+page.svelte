<script>
	import { page } from '$app/stores'; // Import the page store
	import { onMount } from 'svelte';
	import { subgraph_query } from '$lib/queries/subgraph.sparql';
	// @ts-ignore
	import { Parser } from 'n3';

	// Subscribing to the page store to get the URL parameters
	// @ts-ignore
	// @ts-ignore
	$: console.log($page.params.id); // Debug

	// @ts-ignore
	// @ts-ignore
	import { dataset_gsp_endpoint, sparql_url } from '../../../store';
	import { basicAuth } from '../../../store';

	import cytoscape from 'cytoscape';
	// @ts-ignore
	// @ts-ignore
	let cy;

	let serverResponse = ''; // Variable to hold the server's response
	let cyElements = []; // Will hold the nodes and edges for Cytoscape

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
				visualizeWorkflow(data);
				//console.log('Server response:', serverResponse);
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

	// Parse the Turtle data and prepare Cytoscape elements
	// @ts-ignore
	async function visualizeWorkflow(data) {
		const parser = new Parser({ format: 'text/turtle' });

		const nodeMap = new Map(); // To store nodes and their properties

		// @ts-ignore
		const cyEdges = []; // To store edges (predicates as links between subject and object)

		// Some predicates simply define an edge between two nodes
		const edgeDefiningPreds = [
			'provone:wasPartOf',
			'prov:used',
			'prov:wasGeneratedBy',
			'prov:wasAssociatedWith'
		];

		const quads = parser.parse(data);

		// @ts-ignore
		quads.forEach((quad) => {
			const localName = getLocalName(quad.predicate.value);
			const subject = quad.subject.value;
			const object = quad.object.value;
			const predicate = quad.predicate.value;

			// Handle the predicate
			// Some predicates simply define an edge in the graph
			if (edgeDefiningPreds.includes(predicate)) {
				cyEdges.push({
					data: {
						source: subject,
						target: object,
						label: predicate
					}
				});
			} else {
				if (!nodeMap.has(quad.subject.value)) {
					nodeMap.set(quad.subject.value, {});
				}
				const nodeData = nodeMap.get(quad.subject.value);
				nodeData[localName] = quad.object.value;
			}
		});

		// Convert Map to Cytoscape node elements
		const cyNodes = Array.from(nodeMap.entries()).map(([id, data]) => ({
			data: {
				id,
				...data
			}
		}));

		console.log(cyNodes)
		// Add edges to the elements list
		cyElements = [...cyNodes];


		// Specify types
		const agentTypes = {}

		// Parse the Turtle string and store each quad
		// @ts-ignore
		const cy = cytoscape({
			container: document.getElementById('cy'),
			// @ts-ignore
			elements: cyElements,
			style: [
				// the stylesheet for the graph
				// Agent node style
				{
					selector: 'node[type="prov:Agent"], node[type="provone:User"]',
					style: {
						shape: 'polygon',
						'shape-polygon-points': '1, 1, -1 1, -1, 0, 0, -1, 1, 0',
						width: '40px',
						height: '40px',
						'background-color': '#e27602',
						'border-width': '1px',
						'border-color': 'black'
					}
				},
				{
					selector: 'node',
					style: {
						content: 'data(label)',
						label: 'data(label)'
					}
				},
				// Entity node Style
				{
					selector: 'node[type="prov:Entity"], node[type="provone:Data"]',
					style: {
						shape: 'ellipse',
						width: '75px',
						height: '40px',
						'background-color': '#fffc87',
						'border-width': '1px',
						'border-color': '#353aff'
					}
				},
				// Activity node Style
				{
					selector: 'node[type="prov:Activity"], node[type="provone:Execution"]',
					style: {
						shape: 'rectangle',
						width: '40px',
						height: '40px',
						'background-color': '#9fb1fc',
						'border-width': '1px',
						'border-color': '#353aff'
					}
				},

				{
					selector: 'edge',
					style: {
						width: 3,
						'line-color': '#ccc',
						'target-arrow-color': '#ccc',
						'target-arrow-shape': 'triangle',
						'curve-style': 'bezier',
						label: 'data(label)'
					}
				}
			],

			layout: {
				name: 'breadthfirst'
			}
		});

		cy.center()
		cy.fit()
	}


	// @ts-ignore
	function getLocalName(uri) {
		const parts = uri.split('#');
		if (parts.length > 1) {
			return parts[1];
		} else {
			return uri.split(':')[1];
		}
	}
</script>

<div>
	<h1>Execution Page</h1>
	<p>Execution ID: {$page.params.id}</p>
	<!-- Display the ID -->

	<!-- Button to trigger the fetch request -->
	<!--<button on:click={handleConnect}>Fetch Data</button>-->

	<!-- Textarea to display the server response -->
	<textarea readonly bind:value={serverResponse}></textarea>
	<div id="cy" style="width: 600px; height: 400px;"></div>
</div>

<style>
	textarea {
		width: 100%;
		height: 200px;
		padding: 10px;
		font-family: monospace;
		background-color: #f0f0f0;
		border: 1px solid #ccc;
	}

	#cy {
		border: 1px solid black;
	}
</style>
