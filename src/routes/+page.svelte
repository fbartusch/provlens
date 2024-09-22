<script>
	import { goto } from '$app/navigation';
	import { execution_query } from '$lib/queries/execution.sparql';

	import { fuseki_url } from '../store';
	import { fuseki_dataset } from '../store';
	import { dataset_gsp_endpoint } from '../store';
	import { dataset_sparql_endpoint } from '../store';
	import { fuseki_user } from '../store';
	import { fuseki_pw } from '../store';

	import { ping_url } from '../store';
	import { gsp_url } from '../store';
	import { sparql_url } from '../store';
	import { basicAuth } from '../store';

	console.log('ping_url:', $ping_url);
	console.log('gsp_url:', $gsp_url);
	console.log('sparql_url:', $sparql_url);

	let serverResponse = ''; // Variable to hold the server's response
	let responseText = '';
	let hasError = false;

	/**
	 * @type {string | any[]}
	 */
	let tableData = []; // Will hold the rows of the table

	// Function to handle connect button click
	const handleConnect = async () => {
		console.log('fuseki_url:', $fuseki_url);
		console.log('fuseki_dataset', $fuseki_dataset);
		console.log('dataset_gsp_endpoint', $dataset_gsp_endpoint);
		console.log('dataset_sparql_endpoint', $dataset_sparql_endpoint);
		console.log('fuseki_user:', $fuseki_user);

		// Try to ping server
		try {
			// Reset error state and response text
			hasError = false;
			responseText = 'Ping server...';

			const response = await fetch($ping_url, {
				method: 'GET',
				headers: {}
			});

			if (response.ok) {
				serverResponse = await response.text();
				console.log('Server Ping result', serverResponse);
			} else {
				console.error('Failed to ping Fuseki:', response.statusText);
				throw new Error(`HTTP error! Status: ${response.status}`);
			}
		} catch (error) {
			console.error('Error:', error);
			hasError = true;
			serverResponse = `Ping server failed.\nURL: ${$ping_url}\nError message: ${error.message}\nPossible reasons: Wrong URL or Fuseki is not running.`;
		}

		// Send SPARQL query for workflow executions
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
					Accept: 'application/sparql-results+json' // Expecting JSON response
				},
				body: new URLSearchParams({
					query: execution_query
				})
			});

			if (response.ok) {
				// Parse the JSON response
				const data = await response.json();

				// @@ts-expect-error
				// Extract the bindings from the results and map them to table rows
				tableData = data.results.bindings.map((row) => ({
					execution: row.execution ? row.execution.value : 'Unknown',
					label: row.label ? row.label.value : 'Unknown',
					startTime: row.startTime ? row.startTime.value : 'Unknown',
					endTime: row.endTime ? row.endTime.value : 'Unknown'
				}));
				serverResponse = JSON.stringify(data, null, 2); // Pretty print JSON response
				console.log('Server response:', serverResponse);
			} else {
				console.error('SPARQL query failed:', response.statusText);
				throw new Error(`HTTP error! Status: ${response.status}`);
			}
		} catch (error) {
			console.error('Error:', error);
			tableData = []; // Clear table data on error
			hasError = true;
			serverResponse = `Fetching data failed.\nEndpoint URL: ${sparql_url}\nError message: ${error.message}\nPossible reasons: Wrong URL, Dataset, Endpoint, Username, or Password.`;
		}
	};

	/**
	 * @param {any} id
	 */
	function showData(id) {
		goto(`/data/${id}`);
	}

	/**
	 * @param {any} id
	 */
	function visualizeTrace(id) {
		goto(`/visualize/${id}`);
	}
</script>

<div class="container">
	<h2>Fuseki connection details</h2>

	<div class="input-group">
		<label for="fuseki_url">URL</label>
		<input type="text" id="fuseki_url" bind:value={$fuseki_url} placeholder="Enter Fuseki URL" />
	</div>

	<div class="input-group">
		<label for="fuseki_dataset">Dataset</label>
		<input
			type="text"
			id="fuseki_dataset"
			bind:value={$fuseki_dataset}
			placeholder="Enter Dataset name"
		/>
	</div>

	<div class="input-group">
		<label for="dataset_gsp_endpoint">Graph Store Protocol Endpoint</label>
		<input
			type="text"
			id="dataset_gsp_endpoint"
			bind:value={$dataset_gsp_endpoint}
			placeholder="Enter SPARQL Graph Store Protocol (GSP) endpoint"
		/>
	</div>

	<div class="input-group">
		<label for="dataset_sparql_endpoint">SPARQL Endpoint</label>
		<input
			type="text"
			id="dataset_sparql_endpoint"
			bind:value={$dataset_sparql_endpoint}
			placeholder="Enter SPARQL Query endpoint"
		/>
	</div>

	<div class="input-group">
		<label for="fuseki_user">Username</label>
		<input type="text" id="fuseki_user" bind:value={$fuseki_user} placeholder="Enter Username" />
	</div>

	<div class="input-group">
		<label for="fuseki_pw">Password</label>
		<input type="password" id="fuseki_pw" bind:value={$fuseki_pw} placeholder="Enter password" />
	</div>

	<div>
		<!-- Button to trigger the fetch request -->
		<button on:click={handleConnect}>Connect</button>

		<!-- Conditionally display the textarea if there is an error -->
		<!--{#if hasError}-->
		<textarea readonly bind:value={serverResponse}></textarea>
		<!--{/if}-->

		{#if tableData.length > 0}
			<h3>Query Results</h3>
			<table>
				<thead>
					<tr>
						<th>Label</th>
						<th>Start Time</th>
						<th>End Time</th>
						<th>Actions</th>
						<!-- Header for buttons -->
					</tr>
				</thead>
				<tbody>
					{#each tableData as row}
						<tr>
							<td>{row.label}</td>
							<td>{row.startTime}</td>
							<td>{row.endTime}</td>
							<td>
								<button on:click={() => showData(row.execution)} class="btn show-data"
									>Show Data</button
								>
								<button on:click={() => visualizeTrace(row.execution)} class="btn visualize"
									>Visualize</button
								>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>

<style>
	.container {
		max-width: 1000px;
		margin: 0 auto;
		padding: 20px;
		border-radius: 10px;
		background-color: #f9f9f9;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}

	.input-group {
		margin-bottom: 10px;
	}

	label {
		display: block;
		font-weight: bold;
		margin-bottom: 5px;
	}

	input {
		width: 100%;
		padding: 8px;
		border: 1px solid #ccc;
		border-radius: 5px;
	}

	button {
		width: 100%;
		padding: 10px;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}

	button:hover {
		background-color: #0056b3;
	}

	textarea {
		width: 100%;
		height: 200px;
		padding: 10px;
		color: red;
	}

	/* Basic reset for table styling */
	table {
		width: 100%;
		border-collapse: collapse;
		margin: 20px 0;
		font-size: 16px;
		text-align: left;
	}

	/* Header styling */
	th {
		background-color: #4caf50; /* Green background */
		color: white; /* White text */
		padding: 12px 15px;
	}

	/* Row styling */
	td {
		border: 1px solid #ddd; /* Light grey border */
		padding: 12px 15px;
	}

	/* Zebra striping for rows */
	tr:nth-child(even) {
		background-color: #f2f2f2; /* Light grey background */
	}

	/* Hover effect for rows */
	tr:hover {
		background-color: #ddd; /* Darker grey background */
	}

	/* Button styling */
	.btn {
		padding: 8px 12px;
		border: none;
		border-radius: 4px;
		color: white;
		cursor: pointer;
		font-size: 14px;
		margin-right: 5px;
	}

	/* Specific button colors */
	.show-data {
		background-color: #4caf50; /* Green */
	}

	.visualize {
		background-color: #2196f3; /* Blue */
	}

	/* Hover effects for buttons */
	.show-data:hover {
		background-color: #45a049; /* Darker green */
	}

	.visualize:hover {
		background-color: #0b7dda; /* Darker blue */
	}

	/* Responsive table */
	@media (max-width: 768px) {
		table {
			width: 100%;
			display: block;
			overflow-x: auto;
			white-space: nowrap;
		}

		th,
		td {
			display: block;
			text-align: right;
			padding: 10px;
		}

		th {
			background-color: #4caf50;
			color: white;
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			text-align: left;
		}

		td {
			position: relative;
			padding-left: 50%;
		}

		td::before {
			content: attr(data-label);
			position: absolute;
			left: 0;
			width: 45%;
			padding-right: 10px;
			white-space: nowrap;
			font-weight: bold;
			background: #f9f9f9;
		}
	}
</style>
