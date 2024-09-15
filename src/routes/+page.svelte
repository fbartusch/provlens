<script>
  import { execution_query } from '$lib/queries/execution.sparql';

	// Declare variables for the input fields
	let fuseki_url = 'https://127.0.0.1';
	let fuseki_dataset = 'ds';
	let dataset_gsp_endpoint = 'data';
  let dataset_sparql_endpoint = 'sparql';
	let fuseki_user = 'user1';
	let fuseki_pw = 'pw';
	let serverResponse = ''; // Variable to hold the server's response
	let responseText = '';
	let hasError = false;

	// Function to handle connect button click
	const handleConnect = async () => {
		console.log('fuseki_url:', fuseki_url);
		console.log('fuseki_dataset', fuseki_dataset);
		console.log('dataset_gsp_endpoint', dataset_gsp_endpoint);
    console.log('dataset_sparql_endpoint', dataset_sparql_endpoint);
		console.log('fuseki_user:', fuseki_user);

    // URLs
		const ping_url = `${fuseki_url}/$/ping`;
    const gsp_url = `${fuseki_url}/${fuseki_dataset}/${dataset_gsp_endpoint}`;
    const sparql_url = `${fuseki_url}/${fuseki_dataset}/${dataset_sparql_endpoint}`;
    // Create Basic Authorization header by encoding username and password to Base64
		const basicAuth = btoa(`${fuseki_user}:${fuseki_pw}`); // Base64 encode username:password
    console.log('ping_url:', ping_url);
    console.log('gsp_url:', gsp_url);
    console.log('sparql_url:', sparql_url);

		// Try to ping server
		try {
			// Reset error state and response text
			hasError = false;
			responseText = 'Ping server...';

			const response = await fetch(ping_url, {
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
			serverResponse = `Ping server failed.\nURL: ${ping_url}\nError message: ${error.message}\nPossible reasons: Wrong URL or Fuseki is not running.`;
		}

    // Send SPARQL query for workflow executions
    try {
      // Reset error state and response text
			hasError = false;
			responseText = 'Catch data...';

      // Send the request using fetch
      const response = await fetch(sparql_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',  // SPARQL usually uses this MIME type
          Authorization: `Basic ${basicAuth}`, // Include Basic Authentication header
          'Accept': 'application/sparql-results+json'  // Expecting JSON response
        },
        body: new URLSearchParams({
          query: execution_query
        })
      });


      if (response.ok) {
				// Parse the JSON response
        const data = await response.json();
        serverResponse = JSON.stringify(data, null, 2);  // Pretty print JSON response
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
</script>

<div class="container">
	<h2>Fuseki connection details</h2>

	<div class="input-group">
		<label for="fuseki_url">URL</label>
		<input
			type="text"
			id="fuseki_url"
			bind:value={fuseki_url}
			placeholder="Enter Fuseki URL"
		/>
	</div>

	<div class="input-group">
		<label for="fuseki_dataset">Dataset</label>
		<input
			type="text"
			id="fuseki_dataset"
			bind:value={fuseki_dataset}
			placeholder="Enter Dataset name"
		/>
	</div>

	<div class="input-group">
		<label for="dataset_gsp_endpoint">Graph Store Protocol Endpoint</label>
		<input
			type="text"
			id="dataset_gsp_endpoint"
			bind:value={dataset_gsp_endpoint}
			placeholder="Enter SPARQL Graph Store Protocol (GSP) endpoint"
		/>
	</div>

	<div class="input-group">
		<label for="dataset_sparql_endpoint">SPARQL Endpoint</label>
		<input
			type="text"
			id="dataset_sparql_endpoint"
			bind:value={dataset_sparql_endpoint}
			placeholder="Enter SPARQL Query endpoint"
		/>
	</div>

	<div class="input-group">
		<label for="fuseki_user">Username</label>
		<input type="text" id="fuseki_user" bind:value={fuseki_user} placeholder="Enter Username" />
	</div>

	<div class="input-group">
		<label for="fuseki_pw">Password</label>
		<input type="password" id="fuseki_pw" bind:value={fuseki_pw} placeholder="Enter password" />
	</div>

  <div>
    <!-- Button to trigger the fetch request -->
    <button on:click={handleConnect}>Connect</button>
  
    <!-- Conditionally display the textarea if there is an error -->
    <!--{#if hasError}-->
      <textarea readonly bind:value={serverResponse}></textarea>
    <!--{/if}-->
  </div>
</div>

<style>
	.container {
		max-width: 400px;
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
</style>
