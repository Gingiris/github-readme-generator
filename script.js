// GitHub README Generator v2 - Gingiris
// One-click README optimization

console.log('GitHub README Generator v2 loaded');

let repoData = null;
let generatedReadme = '';

// Token management
function saveToken() {
    const token = document.getElementById('githubToken')?.value.trim();
    if (token) {
        localStorage.setItem('gh_token', token);
        alert('Token saved!');
    }
}

function getToken() {
    return localStorage.getItem('gh_token') || '';
}

document.addEventListener('DOMContentLoaded', function() {
    const savedToken = getToken();
    if (savedToken) {
        const tokenInput = document.getElementById('githubToken');
        if (tokenInput) tokenInput.value = savedToken;
    }
    
    document.getElementById('repoUrl')?.addEventListener('keypress', e => {
        if (e.key === 'Enter') { e.preventDefault(); analyzeRepo(); }
    });
});

async function analyzeRepo() {
    const url = document.getElementById('repoUrl')?.value.trim();
    if (!url) { alert('Please enter a GitHub URL'); return; }

    const match = url.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
    if (!match) { alert('Invalid GitHub URL. Example: https://github.com/username/repo'); return; }

    const btn = document.getElementById('analyzeBtn');
    btn.querySelector('.btn-text')?.classList.add('hidden');
    btn.querySelector('.btn-loading')?.classList.remove('hidden');
    btn.disabled = true;

    try {
        const [, owner, repo] = match;
        const token = getToken();
        const headers = token ? { 'Authorization': `token ${token}` } : {};
        
        // Fetch repo info
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
        
        if (!response.ok) {
            if (response.status === 403) throw new Error('Rate limit exceeded. Add a GitHub token or wait a bit.');
            if (response.status === 404) throw new Error('Repo not found. Check the URL.');
            throw new Error('GitHub API error');
        }
        
        repoData = await response.json();
        repoData.owner_name = owner;
        
        // Try to fetch languages
        try {
            const langResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers });
            if (langResp.ok) {
                repoData.languages = await langResp.json();
            }
        } catch (e) { /* ignore */ }
        
        // Try to fetch topics
        try {
            const topicsResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/topics`, { 
                headers: { ...headers, 'Accept': 'application/vnd.github.mercy-preview+json' }
            });
            if (topicsResp.ok) {
                const topicsData = await topicsResp.json();
                repoData.topics = topicsData.names || [];
            }
        } catch (e) { /* ignore */ }
        
        displayRepoInfo(repoData);
        prefillForm(repoData);
        
        document.getElementById('repoInfo')?.classList.remove('hidden');
        document.getElementById('step2')?.classList.remove('hidden');
        document.getElementById('generateBtn')?.classList.remove('hidden');
        document.getElementById('step2')?.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        alert(error.message);
    } finally {
        btn.querySelector('.btn-text')?.classList.remove('hidden');
        btn.querySelector('.btn-loading')?.classList.add('hidden');
        btn.disabled = false;
    }
}

function displayRepoInfo(data) {
    document.getElementById('repoName').textContent = data.name;
    document.getElementById('repoStars').textContent = formatStars(data.stargazers_count);
    document.getElementById('repoLang').textContent = data.language || 'N/A';
    
    const created = new Date(data.created_at);
    const months = Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24 * 30));
    document.getElementById('repoAge').textContent = months < 12 ? months + 'mo' : Math.floor(months / 12) + 'y';
    
    document.getElementById('repoDesc').textContent = data.description || 'No description';
}

function prefillForm(data) {
    // Auto-generate features based on topics and description
    let features = [];
    
    if (data.topics && data.topics.length > 0) {
        data.topics.slice(0, 4).forEach(topic => {
            features.push(`✨ ${topic.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`);
        });
    }
    
    if (data.description) {
        const desc = data.description.toLowerCase();
        if (desc.includes('fast') || desc.includes('performance')) features.push('⚡ Lightning fast performance');
        if (desc.includes('simple') || desc.includes('easy')) features.push('🎯 Simple and easy to use');
        if (desc.includes('secure') || desc.includes('security')) features.push('🔒 Secure by default');
        if (desc.includes('ai') || desc.includes('ml')) features.push('🤖 AI-powered');
        if (desc.includes('open source') || desc.includes('oss')) features.push('📖 Open source');
    }
    
    if (features.length === 0) {
        features = ['⚡ Feature 1', '🔒 Feature 2', '🎨 Feature 3'];
    }
    
    document.getElementById('features').value = features.slice(0, 5).join('\n');
    
    // Auto-generate install command based on language
    const lang = (data.language || '').toLowerCase();
    let installCmd = '';
    
    if (lang === 'javascript' || lang === 'typescript') {
        installCmd = `npm install ${data.name}`;
    } else if (lang === 'python') {
        installCmd = `pip install ${data.name}`;
    } else if (lang === 'go') {
        installCmd = `go get github.com/${data.owner_name}/${data.name}`;
    } else if (lang === 'rust') {
        installCmd = `cargo add ${data.name}`;
    } else if (lang === 'ruby') {
        installCmd = `gem install ${data.name}`;
    } else {
        installCmd = `git clone https://github.com/${data.owner_name}/${data.name}.git`;
    }
    
    document.getElementById('installCmd').value = installCmd;
}

function generateReadme() {
    if (!repoData) { alert('Please analyze a repo first'); return; }
    
    const name = repoData.name;
    const desc = repoData.description || 'A great project';
    const owner = repoData.owner_name;
    const lang = repoData.language || '';
    const license = repoData.license?.spdx_id || 'MIT';
    
    const features = document.getElementById('features').value.trim();
    const installCmd = document.getElementById('installCmd').value.trim();
    const usageExample = document.getElementById('usageExample').value.trim();
    
    const includeBadges = document.getElementById('includeBadges').checked;
    const includeDemo = document.getElementById('includeDemo').checked;
    const includeToc = document.getElementById('includeToc').checked;
    const includeContributing = document.getElementById('includeContributing').checked;
    const includeLicense = document.getElementById('includeLicense').checked;
    const includeRoadmap = document.getElementById('includeRoadmap').checked;
    
    let readme = '';
    
    // Title
    readme += `# ${name}\n\n`;
    
    // Badges
    if (includeBadges) {
        readme += `[![GitHub stars](https://img.shields.io/github/stars/${owner}/${name}?style=flat-square)](https://github.com/${owner}/${name}/stargazers)\n`;
        readme += `[![License](https://img.shields.io/badge/license-${license}-blue?style=flat-square)](LICENSE)\n`;
        
        if (lang.toLowerCase() === 'javascript' || lang.toLowerCase() === 'typescript') {
            readme += `[![npm version](https://img.shields.io/npm/v/${name}?style=flat-square)](https://www.npmjs.com/package/${name})\n`;
        } else if (lang.toLowerCase() === 'python') {
            readme += `[![PyPI version](https://img.shields.io/pypi/v/${name}?style=flat-square)](https://pypi.org/project/${name}/)\n`;
        }
        
        readme += `[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](http://makeapullrequest.com)\n\n`;
    }
    
    // Description
    readme += `${desc}\n\n`;
    
    // Demo
    if (includeDemo) {
        readme += `## 🎬 Demo\n\n`;
        readme += `![${name} Demo](https://via.placeholder.com/800x400?text=${encodeURIComponent(name + ' Demo')})\n\n`;
        readme += `<!-- Replace with your actual demo GIF or screenshot -->\n\n`;
    }
    
    // TOC
    if (includeToc) {
        readme += `## 📑 Table of Contents\n\n`;
        if (features) readme += `- [Features](#-features)\n`;
        if (installCmd) readme += `- [Installation](#-installation)\n`;
        if (usageExample) readme += `- [Quick Start](#-quick-start)\n`;
        if (includeRoadmap) readme += `- [Roadmap](#️-roadmap)\n`;
        if (includeContributing) readme += `- [Contributing](#-contributing)\n`;
        if (includeLicense) readme += `- [License](#-license)\n`;
        readme += '\n';
    }
    
    // Features
    if (features) {
        readme += `## ✨ Features\n\n`;
        features.split('\n').filter(f => f.trim()).forEach(feature => {
            const trimmed = feature.trim();
            if (!trimmed.startsWith('-') && !trimmed.startsWith('*')) {
                readme += `- ${trimmed}\n`;
            } else {
                readme += `${trimmed}\n`;
            }
        });
        readme += '\n';
    }
    
    // Installation
    if (installCmd) {
        readme += `## 📦 Installation\n\n`;
        readme += '```bash\n' + installCmd + '\n```\n\n';
    }
    
    // Usage
    if (usageExample) {
        readme += `## 🚀 Quick Start\n\n`;
        readme += '```' + getLangForCodeBlock(lang) + '\n' + usageExample + '\n```\n\n';
    }
    
    // Roadmap
    if (includeRoadmap) {
        readme += `## 🗺️ Roadmap\n\n`;
        readme += `- [ ] Feature 1\n- [ ] Feature 2\n- [ ] Feature 3\n\n`;
        readme += `See the [open issues](https://github.com/${owner}/${name}/issues) for a full list.\n\n`;
    }
    
    // Contributing
    if (includeContributing) {
        readme += `## 🤝 Contributing\n\n`;
        readme += `Contributions are welcome! Please feel free to submit a Pull Request.\n\n`;
        readme += `1. Fork the project\n`;
        readme += `2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)\n`;
        readme += `3. Commit your changes (\`git commit -m 'Add AmazingFeature'\`)\n`;
        readme += `4. Push to the branch (\`git push origin feature/AmazingFeature\`)\n`;
        readme += `5. Open a Pull Request\n\n`;
    }
    
    // License
    if (includeLicense) {
        readme += `## 📜 License\n\n`;
        readme += `Distributed under the ${license} License. See \`LICENSE\` for more information.\n\n`;
    }
    
    // Footer
    readme += `---\n\n`;
    readme += `<p align="center">Made with ❤️</p>\n`;
    readme += `<p align="center">If you found this helpful, please ⭐ the repo!</p>\n`;
    
    generatedReadme = readme;
    
    document.getElementById('readmeMarkdown').textContent = readme;
    document.getElementById('readmePreview').innerHTML = marked.parse(readme);
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

function getLangForCodeBlock(lang) {
    const map = {
        'javascript': 'javascript', 'typescript': 'typescript',
        'python': 'python', 'go': 'go', 'rust': 'rust',
        'java': 'java', 'ruby': 'ruby', 'php': 'php'
    };
    return map[(lang || '').toLowerCase()] || '';
}

function formatStars(stars) {
    return stars >= 1000 ? (stars / 1000).toFixed(1) + 'k' : stars.toString();
}

function showTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    
    if (tab === 'preview') {
        document.querySelector('.tab:first-child').classList.add('active');
        document.getElementById('previewTab').classList.remove('hidden');
    } else {
        document.querySelector('.tab:last-child').classList.add('active');
        document.getElementById('markdownTab').classList.remove('hidden');
    }
}

function copyReadme() {
    navigator.clipboard.writeText(generatedReadme).then(() => {
        document.getElementById('toast').classList.remove('hidden');
        setTimeout(() => document.getElementById('toast').classList.add('hidden'), 2000);
    });
}

function downloadReadme() {
    const blob = new Blob([generatedReadme], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function restart() {
    repoData = null;
    generatedReadme = '';
    document.getElementById('repoUrl').value = '';
    ['repoInfo', 'step2', 'generateBtn', 'results'].forEach(id => 
        document.getElementById(id)?.classList.add('hidden')
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
