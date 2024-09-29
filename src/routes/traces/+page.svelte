<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { execution_query } from '$lib/queries/execution.sparql';
	import { sparql_url } from '../../store';
	import { basicAuth } from '../../store';
	import { isFusekiConnected } from '../../store';
	import { filterWorkflowValue, filterVersionValue, filterEndValue, filterStartValue, filterLabelValue } from '../../store';
	import { filterWorkflowPlaceholder, filterVersionPlaceholder, filterEndPlaceholder, filterStartPlaceholder, filterLabelPlaceholder } from '../../store';

	console.log('sparql_url:', $sparql_url);

	let serverResponse = '';
	let responseText = '';
	let hasError = false;

	/**
	 * @type {string | any[]}
	 */
	let tableData = []; // Will hold the rows of the table

	// Function to handle connect button click
	const handleConnect = async () => {
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
					graph: row.execution ? row.graph.value : 'Unknown',
					wfName: row.wfName ? row.wfName.value : 'Unknown',
					wfVersion: row.wfVersion ? row.wfVersion.value : 'Unknown',
					wfmsName: row.wfmsName ? row.wfmsName.value : 'Unknown',
					wfmsVersion: row.wfmsVersion ? row.wfmsVersion.value : 'Unknown',
					execution: row.executionLocalName ? row.executionLocalName.value : 'Unknown',
					label: row.label ? row.label.value : 'Unknown',
					startTime: row.startTime ? formatDate(row.startTime.value) : 'Unknown',
					endTime: row.endTime ? formatDate(row.endTime.value) : 'Unknown'
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


	function formatDate(dateString) {
		const date = new Date(dateString);
		// Get the timezone offset in hours and minutes
		const offset = -date.getTimezoneOffset();
		const offsetHours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
		const offsetMinutes = String(Math.abs(offset) % 60).padStart(2, '0');
		const offsetSign = offset >= 0 ? '+' : '-';

    	const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        timeZoneName: 'short' 
		};

		const formattedDate = date.toLocaleString('de');

		return formattedDate;
	}

	function applyFilters() {
		// Get Table DOM element
		const table = document.getElementById('traces-table');
		const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

    // Loop through all rows in the table body
		for (let i = 0; i < rows.length; i++) {
			const workflow = rows[i].getElementsByTagName('td')[0].textContent.toLowerCase();
			const version = rows[i].getElementsByTagName('td')[1].textContent.toLowerCase();
			const startTime = rows[i].getElementsByTagName('td')[2].textContent.toLowerCase();
			const endTime = rows[i].getElementsByTagName('td')[3].textContent.toLowerCase();
			const label = rows[i].getElementsByTagName('td')[4].textContent.toLowerCase();

      // Check if each row matches the filter
      if (
        (workflow.indexOf($filterWorkflowValue) > -1 || $filterWorkflowValue === '') &&
        (version.indexOf($filterVersionValue) > -1 || $filterVersionValue === '') &&
        (startTime.indexOf($filterStartValue) > -1 || $filterStartValue === '') &&
        (endTime.indexOf($filterEndValue) > -1 || $filterEndValue === '') &&
        (label.indexOf($filterLabelValue) > -1 || $filterLabelValue === '')) {
			rows[i].style.display = ''; // Show row
		} else {
			rows[i].style.display = 'none'; // Hide row
		}
	}
  }

  function clearFilters() {
	$filterWorkflowValue = '';
	$filterVersionValue = '';
	$filterEndValue = '';
	$filterStartValue = '';
	$filterLabelValue = '';
	// Reapply filters to show all rows
    applyFilters(); 
  }

	// Automatically run the function when the component is mounted
	onMount(() => {
		if(isFusekiConnected) {
			handleConnect();
		}
	});
</script>

<div class="container">
	<h2>Trace list</h2>

	<!-- Filter panel -->
	<div>
		<!-- Filter Section -->
		<div>
		  <label for="workflow-filter">Workflow:</label>
		  <input
		  	type="text"
			id="workflow-filter"
			bind:value={$filterWorkflowValue}
			placeholder={$filterWorkflowPlaceholder}>
		</div>
		
		<div>
		  <label for="version-filter">Version:</label>
		  <input
		  	type="text"
		  	id="version-filter"
			bind:value={$filterVersionValue}
			placeholder={$filterVersionPlaceholder}>
		</div>
		
		<div>
		  <label for="start-time-filter">Start Time:</label>
		  <input
		  	type="text"
			id="start-time-filter"
			bind:value={$filterStartValue}
			placeholder={$filterStartPlaceholder}>
		</div>
	  
		<div>
		  <label for="end-time-filter">End Time:</label>
		  <input
		  	type="text"
			id="end-time-filter"
			bind:value={$filterEndValue}
			placeholder={$filterEndPlaceholder}>
		</div>
	  
		<div>
		  <label for="label-filter">Label:</label>
		  <input
		  	type="text"
			id="label-filter"
			bind:value={$filterLabelValue}
			placeholder={$filterLabelPlaceholder}>
		</div>
		
		<div>
		  <button id="apply-filters" on:click={applyFilters}>Apply Filters</button>
		  <button id="clear-filters" on:click={clearFilters}>Clear Filters</button>
		</div>
	  </div>

	<!-- Refresh button -->
	<div>
		<button on:click={handleConnect}>Refresh</button>
	</div>

	<!-- Trace table -->
	<div>
		{#if tableData.length > 0}
			<table id="traces-table">
				<thead>
					<tr>
						<th>Workflow</th>
						<th>Version</th>
						<th>Start Time</th>
						<th>End Time</th>
						<th>Label</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each tableData as row}
						<tr>
							<td>{row.wfName}</td>
							<td>{row.wfVersion}</td>
							<td>{row.startTime}</td>
							<td>{row.endTime}</td>
							<td>{row.label}</td>
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

	<!-- Conditionally display the textarea if there is an error -->
	{#if hasError}
	<textarea readonly bind:value={serverResponse}></textarea>
	{/if}
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
