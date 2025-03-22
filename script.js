// Wait until the DOM is fully loaded before executing scripts
document.addEventListener('DOMContentLoaded', () => {
    fetchRepos('Arehner1'); // Load default GitHub profile on page load
    document.getElementById('search-btn').addEventListener('click', () => {
        const username = document.getElementById('username').value.trim(); 
        fetchRepos(username); 
    });
});

// Function to fetch and display repositories for a given GitHub username
async function fetchRepos(username) {
    if (!username) {
        alert('Please enter a GitHub username.'); 
        return;
    }
    
    const repoContainer = document.getElementById('repo-container');
    repoContainer.innerHTML = ''; 

    try {
        // Fetch repositories from GitHub API
        const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=20&sort=updated`);
        if (!response.ok) throw new Error('User not found');
        
        const repos = await response.json();

        if (repos.length === 0) {
            repoContainer.innerHTML = '<p>No repositories found.</p>'; 
            return;
        }

        // Fetch additional details (commits and languages) 
        const repoData = await Promise.all(repos.map(async (repo) => {
            const [commitsRes, languagesRes] = await Promise.all([
                fetch(repo.commits_url.replace('{/sha}', '')),
                fetch(repo.languages_url)
            ]);
            const commits = commitsRes.ok ? await commitsRes.json() : [];
            const languages = languagesRes.ok ? Object.keys(await languagesRes.json()) : [];
            
            return {
                name: repo.name,
                url: repo.html_url, 
                description: repo.description || 'No description', 
                created: new Date(repo.created_at).toLocaleDateString(), 
                updated: new Date(repo.updated_at).toLocaleDateString(), 
                watchers: repo.watchers, 
                languages: languages.join(', ') || 'None', 
                commits: commits.length 
            };
        }));

        // Create and display repository cards with fetched data
        repoData.forEach(repo => {
            const repoCard = document.createElement('div');
            repoCard.classList.add('repo-card'); 
            repoCard.innerHTML = `
                <h3><img src="images/github_icon.png" alt="GitHub Icon" class="repo-icon"> 
                <a href="${repo.url}" target="_blank">${repo.name}</a></h3>
                <p>${repo.description}</p>
                <p><strong>Created:</strong> ${repo.created}</p>
                <p><strong>Updated:</strong> ${repo.updated}</p>
                <p><strong>Watchers:</strong> ${repo.watchers}</p>
                <p><strong>Languages:</strong> ${repo.languages}</p>
                <p><strong>Commits:</strong> ${repo.commits}</p>
            `;
            repoContainer.appendChild(repoCard); 
        });
    } catch (error) {
        repoContainer.innerHTML = '<p>Error: User not found or API issue.</p>'; 
    }
}
