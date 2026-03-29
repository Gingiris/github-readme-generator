// GitHub README Generator - Gingiris
// Create professional README.md files in seconds

console.log('GitHub README Generator loaded');

let generatedReadme = '';

document.addEventListener('DOMContentLoaded', function() {
    // Auto-generate on input changes for live preview
    document.querySelectorAll('input, textarea, select').forEach(el => {
        el.addEventListener('input', debounce(updatePreviewIfVisible, 500));
    });
});

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => { clearTimeout(timeout); func(...args); };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function updatePreviewIfVisible() {
    if (!document.getElementById('results').classList.contains('hidden')) {
        generateReadme();
    }
}

function generateReadme() {
    const projectName = document.getElementById('projectName').value.trim();
    const projectDesc = document.getElementById('projectDesc').value.trim();
    
    if (!projectName || !projectDesc) {
        alert('Please fill in Project Name and Description');
        return;
    }
    
    const projectType = document.getElementById('projectType').value;
    const language = document.getElementById('language').value;
    const features = document.getElementById('features').value.trim();
    const installCmd = document.getElementById('installCmd').value.trim();
    const usageExample = document.getElementById('usageExample').value.trim();
    const githubUser = document.getElementById('githubUser').value.trim();
    const license = document.getElementById('license').value;
    
    const includeBadges = document.getElementById('includeBadges').checked;
    const includeDemo = document.getElementById('includeDemo').checked;
    const includeToc = document.getElementById('includeToc').checked;
    const includeContributing = document.getElementById('includeContributing').checked;
    const includeLicense = document.getElementById('includeLicense').checked;
    const includeRoadmap = document.getElementById('includeRoadmap').checked;
    
    let readme = '';
    
    // Title and Badges
    readme += `# ${projectName}\n\n`;
    
    if (includeBadges && githubUser) {
        readme += generateBadges(githubUser, projectName, license, language);
        readme += '\n\n';
    }
    
    // Description
    readme += `${projectDesc}\n\n`;
    
    // Demo placeholder
    if (includeDemo) {
        readme += `## 🎬 Demo\n\n`;
        readme += `![${projectName} Demo](https://via.placeholder.com/800x400?text=${encodeURIComponent(projectName + ' Demo')})\n\n`;
        readme += `<!-- Replace with your actual demo GIF or screenshot -->\n\n`;
    }
    
    // Table of Contents
    if (includeToc) {
        readme += generateToc(features, installCmd, includeContributing, includeLicense, includeRoadmap);
    }
    
    // Features
    if (features) {
        readme += `## ✨ Features\n\n`;
        features.split('\n').filter(f => f.trim()).forEach(feature => {
            const trimmed = feature.trim();
            if (!trimmed.startsWith('-') && !trimmed.startsWith('*') && !trimmed.match(/^[•⚡🔒🎨📦🚀💡🔥✅]/)) {
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
        readme += '```bash\n';
        readme += installCmd + '\n';
        readme += '```\n\n';
    }
    
    // Usage
    if (usageExample) {
        readme += `## 🚀 Quick Start\n\n`;
        readme += '```' + getLanguageForCodeBlock(language) + '\n';
        readme += usageExample + '\n';
        readme += '```\n\n';
    }
    
    // Type-specific sections
    readme += generateTypeSpecificSections(projectType, projectName);
    
    // Roadmap
    if (includeRoadmap) {
        readme += `## 🗺️ Roadmap\n\n`;
        readme += `- [ ] Feature 1\n`;
        readme += `- [ ] Feature 2\n`;
        readme += `- [ ] Feature 3\n\n`;
        readme += `See the [open issues](https://github.com/${githubUser || 'username'}/${projectName}/issues) for a full list of proposed features.\n\n`;
    }
    
    // Contributing
    if (includeContributing) {
        readme += `## 🤝 Contributing\n\n`;
        readme += `Contributions are welcome! Please feel free to submit a Pull Request.\n\n`;
        readme += `1. Fork the project\n`;
        readme += `2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)\n`;
        readme += `3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)\n`;
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
    readme += `<p align="center">Made with ❤️ by <a href="https://github.com/${githubUser || 'username'}">${githubUser || 'Your Name'}</a></p>\n`;
    if (githubUser) {
        readme += `<p align="center">If you found this helpful, please ⭐ the repo!</p>\n`;
    }
    
    generatedReadme = readme;
    
    // Display results
    document.getElementById('readmeMarkdown').textContent = readme;
    document.getElementById('readmePreview').innerHTML = marked.parse(readme);
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

function generateBadges(user, repo, license, language) {
    let badges = '';
    
    // Stars
    badges += `[![GitHub stars](https://img.shields.io/github/stars/${user}/${repo}?style=flat-square)](https://github.com/${user}/${repo}/stargazers)\n`;
    
    // License
    badges += `[![License](https://img.shields.io/badge/license-${license}-blue?style=flat-square)](LICENSE)\n`;
    
    // Language-specific badges
    if (language === 'javascript') {
        badges += `[![npm version](https://img.shields.io/npm/v/${repo}?style=flat-square)](https://www.npmjs.com/package/${repo})\n`;
    } else if (language === 'python') {
        badges += `[![PyPI version](https://img.shields.io/pypi/v/${repo}?style=flat-square)](https://pypi.org/project/${repo}/)\n`;
    } else if (language === 'go') {
        badges += `[![Go Reference](https://pkg.go.dev/badge/github.com/${user}/${repo}.svg)](https://pkg.go.dev/github.com/${user}/${repo})\n`;
    } else if (language === 'rust') {
        badges += `[![Crates.io](https://img.shields.io/crates/v/${repo}?style=flat-square)](https://crates.io/crates/${repo})\n`;
    }
    
    // PRs Welcome
    badges += `[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](http://makeapullrequest.com)\n`;
    
    return badges;
}

function generateToc(features, installCmd, includeContributing, includeLicense, includeRoadmap) {
    let toc = `## 📑 Table of Contents\n\n`;
    
    if (features) toc += `- [Features](#-features)\n`;
    if (installCmd) toc += `- [Installation](#-installation)\n`;
    toc += `- [Quick Start](#-quick-start)\n`;
    if (includeRoadmap) toc += `- [Roadmap](#️-roadmap)\n`;
    if (includeContributing) toc += `- [Contributing](#-contributing)\n`;
    if (includeLicense) toc += `- [License](#-license)\n`;
    
    toc += '\n';
    return toc;
}

function generateTypeSpecificSections(type, name) {
    let sections = '';
    
    switch (type) {
        case 'cli':
            sections += `## ⌨️ Commands\n\n`;
            sections += `| Command | Description |\n`;
            sections += `|---------|-------------|\n`;
            sections += `| \`${name} init\` | Initialize a new project |\n`;
            sections += `| \`${name} run\` | Run the main command |\n`;
            sections += `| \`${name} --help\` | Show help |\n\n`;
            break;
            
        case 'api':
            sections += `## 🔌 API Reference\n\n`;
            sections += `### Base URL\n\n`;
            sections += `\`\`\`\nhttps://api.example.com/v1\n\`\`\`\n\n`;
            sections += `### Endpoints\n\n`;
            sections += `| Method | Endpoint | Description |\n`;
            sections += `|--------|----------|-------------|\n`;
            sections += `| GET | \`/resource\` | Get all resources |\n`;
            sections += `| POST | \`/resource\` | Create a resource |\n\n`;
            break;
            
        case 'library':
            sections += `## 📚 API\n\n`;
            sections += `### Main Functions\n\n`;
            sections += `| Function | Description |\n`;
            sections += `|----------|-------------|\n`;
            sections += `| \`init()\` | Initialize the library |\n`;
            sections += `| \`process(data)\` | Process the input data |\n\n`;
            break;
    }
    
    return sections;
}

function getLanguageForCodeBlock(language) {
    const langMap = {
        'javascript': 'javascript',
        'python': 'python',
        'go': 'go',
        'rust': 'rust',
        'java': 'java',
        'other': ''
    };
    return langMap[language] || '';
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
        showToast();
    }).catch(() => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = generatedReadme;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast();
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

function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 2000);
}

function restart() {
    document.getElementById('results').classList.add('hidden');
    document.querySelectorAll('input[type="text"], textarea').forEach(el => el.value = '');
    document.querySelectorAll('input[type="checkbox"]').forEach(el => {
        el.checked = ['includeBadges', 'includeDemo', 'includeContributing', 'includeLicense'].includes(el.id);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
