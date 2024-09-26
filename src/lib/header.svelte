<script>
	import '@fortawesome/fontawesome-free/css/all.min.css';
	let repoUrl = 'https://github.com/fbartusch/visprov';
</script>

<header>
	<img id="header-logo" src="/logo/PROVLens_Logo_light-font.svg" alt="Logo" />
	<nav>
		<a href="/traces">
			<i class="fas fa-list nav-icon"></i>
			traces
		</a>
		<a href="/settings">
			<i class="fas fa-gears nav-icon"></i>
			settings
		</a>
		<a href="/about">
			<i class="fas fa-circle-info nav-icon"></i>
			info
		</a>
		<a id="header-git-link" href={repoUrl} target="_blank" rel="noopener noreferrer">
			<i class="fab fa-github nav-icon"></i>
			GitHub Repository
		</a>
	</nav>
</header>

<style>
	header {
		justify-content: flex-start; /* Items are aligned to the left */
		margin-right: 2rem;
		background-color: var(--color6);
		padding: 1rem 2rem;
		display: flex;
		align-items: center;
		color: var(--color5); /* Light text color */
		font-family: var(--font-primary);
	}

	#header-logo {
		height: 50px; /* Adjust logo size */
		margin-right: 2rem; /* Space between logo and links */
	}

	#header-git-link {
		margin-left: auto; /* Move GitHub link to the far right */
		padding: 0.5rem 1rem;
		border-radius: 4px;
	}

	nav {
		display: flex; /* links are displayed in a row */
		gap: 0.75rem; /* Space between links */
	}

	.nav-icon {
		font-size: 1.2rem; /* Adjust icon size */
	}

	a {
		text-decoration: none; /* No underline on links */
		color: var(--color5); /* Light Beige text color */
		font-weight: bold;
		transition:
			color 0.3s,
			background-color 0.3s; /* Smooth transition on hover */
		padding: 0.5rem 1rem;
		border-radius: 4px;
	}

	a:hover {
		/*background-color: var(--color3);*/ /* Aqua background on hover */
		/*color: var(--color1);*/ /* Dark text on hover */
	}

	a.active {
		background-color: var(--color4); /* Gold background for active links */
		color: var(--color5); /* Light text on active */
	}
	/*header {
		display: flex;
		align-items: center;
		padding: 1rem;
		background-color: #f8f8f8;
		border-bottom: 1px solid #ddd;
	}

	#header-logo {
		height: 50px;
		margin-right: 2rem;
	}

	nav {
		display: flex;
		gap: 1.5rem;
		flex-grow: 1;
  	}

	nav a {
		color: #0366d6;
		text-decoration: none;
		font-weight: bold;
   		gap: 1rem;
	}

	nav a:hover {
		
	}*/
</style>
