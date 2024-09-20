<script>
	import { page } from '$app/stores'; // Import the page store
	import { onMount } from 'svelte';
	import { subgraph_query } from '$lib/queries/subgraph.sparql';
	// @ts-ignore
	import { Parser } from 'n3';

	// TODO: use Floating UI instead of deprecated Popper2 for tooltips.
	// See: https://github.com/cytoscape/cytoscape.js-popper?tab=readme-ov-file#migration-from-v2
	// See: https://floating-ui.com/docs/migration
	//import Popper from '@popperjs/core';
	//import tippy from 'tippy.js';
	//import cytoscapePopper from 'cytoscape-popper';

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
		/**
		 * @type {{ data: { source: any; target: any; label: any; }; }[]}
		 */
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

		console.log('cyNodes: ', cyNodes);
		console.log('cyEdges: ', cyEdges);
		// Add edges to the elements list
		cyElements = [...cyNodes, ...cyEdges];

		// Specify types
		const agentTypes = {};

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

		cy.center();
		cy.fit();

		// Set tooltip text for each node
		//cy.nodes().forEach(setTooltip);

		/**
		 * 
		 * Event implementations
		 * 
		 */

		/**
		 * Mouseover
		 * 
		 * Show node data information during mouseover
		 */

		// Mouseover
		cy.on('mouseover', 'node', function(evt){
			var node = evt.target;
			//node.scratch('_tooltip').show();
		});

		// Mouseout
		cy.on('mouseout', 'node', function(evt){
			var node = evt.target;
			//node.scratch('_tooltip').hide();
		});


		/**
		 * Mouse Click
		 * 
		 * Hide all other nodes not connected to this tapped node
		 */


		// Click
		cy.on('click', function(event) {

			var evtTarget = event.target;

			if (evtTarget == cy) {
				console.log('click on background');
				cy.nodes().style("opacity", 1.0);
				cy.edges().style("opacity", 1.0);
			}
			else if (evtTarget.isNode()) {
				var node = evtTarget;
				console.log( 'clicked ' + node.id() );

				// Neighbors of clicked node
				var directlyConnected = node.neighborhood().merge(node);
				console.log(directlyConnected);

				// Hide all nodes that are not in Neighborhood
				var absComplement = directlyConnected.absoluteComplement();
				console.log(absComplement)

				absComplement.style("opacity", 0.2);
				directlyConnected.style("opacity", 1.0);

				// Highlight the clicked node
				node.style("border-width", "3px");
				node.style("border-color", "red");
			}

			else if (evtTarget.isEdge) {
				// not yet implemented
			}
		});
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

	/**
	 * Functions
	 */

	// Function that sets tipy tooltip for the element
	function setTooltip(ele) {
		var tooltipText = buildTooltipText(ele);

		// Add tippy tooltip to node data
		var tippyTooltip = makeTippy(ele, tooltipText);
		//tippyTooltip.hide();
		ele.scratch('_tooltip', tippyTooltip);
	}

	function makeTippy(ele, text) {
		var ref = ele.popperRef();

		// Since tippy constructor requires DOM element/elements, create a placeholder
		var dummyDomEle = document.createElement('div');

		var tip = tippy(dummyDomEle, {
			getReferenceClientRect: ref.getBoundingClientRect,
			trigger: 'manual', // mandatory
			// dom element inside the tippy:
			content: function () {
				// function can be better for performance
				var div = document.createElement('div');

				div.innerHTML = text;

				return div;
			},
			// your own preferences:
			arrow: true,
			placement: 'bottom',
			hideOnClick: false,

			sticky: 'reference',

			// if interactive:
			interactive: true,
			appendTo: document.body // or append dummyDomEle to document.body
		});

		return tip;
	}

	// Function returns tooltip text (HTML) for nodes and edges
	function buildTooltipText(ele) {
		var tooltipText = '';
		var data = ele.data();

		if (ele.isEdge()) {
		}

		if (ele.isNode()) {
			var nodeType = data['type'];

			if (nodeType == 'agent') {
				tooltipText =
					data['title'] +
					' ' +
					data['givenName'] +
					' ' +
					data['familyName'] +
					'</br>ORCID: ' +
					data['orcid'] +
					'</br>Mail: ' +
					data['mbox'];
			}

			if (nodeType == 'activity') {
				tooltipText =
					'ID: ' +
					data['id'] +
					'</br>Start: ' +
					data['startTime'] +
					'</br>endTime: ' +
					data['endTime'];
			}

			if (nodeType == 'entity') {
				tooltipText =
					'ID: ' + data['id'] + '</br>SHA-256: ' + data['sha256'] + '</br>path: ' + data['path'];
			}
		}

		return tooltipText;
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
	<div id="cy"></div>
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
		position: absolute;
		left: 50px;
		width: calc(100% - 100px);
		height: calc(100% - 100px);
		border: 1px solid black;
		padding: 5px;
	}
</style>
