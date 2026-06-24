const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:3000/bfhl' 
  : 'https://chitkara-bfhl-backend.onrender.com/bfhl'; // Placeholder for actual Render URL

document.addEventListener('DOMContentLoaded', () => {
  const submitBtn = document.getElementById('submitBtn');
  const edgesInput = document.getElementById('edgesInput');
  const errorMsg = document.getElementById('errorMsg');
  const loading = document.getElementById('loading');
  const resultsSection = document.getElementById('resultsSection');
  
  // Output elements
  const statTrees = document.getElementById('statTrees');
  const statCycles = document.getElementById('statCycles');
  const statLargestRoot = document.getElementById('statLargestRoot');
  const hierarchiesOutput = document.getElementById('hierarchiesOutput');
  const invalidsOutput = document.getElementById('invalidsOutput');
  const duplicatesOutput = document.getElementById('duplicatesOutput');
  const rawJsonOutput = document.getElementById('rawJsonOutput');

  submitBtn.addEventListener('click', async () => {
    // Reset state
    errorMsg.classList.add('hidden');
    resultsSection.classList.add('hidden');
    errorMsg.innerText = '';
    
    let rawText = edgesInput.value.trim();
    if (!rawText) {
      showError("Please enter some edges.");
      return;
    }

    let parsedData = [];
    
    // Try parsing as JSON first
    if (rawText.startsWith('[')) {
      try {
        parsedData = JSON.parse(rawText);
        if (!Array.isArray(parsedData)) throw new Error("Not an array");
      } catch (e) {
        showError("Invalid JSON array format. Please fix the JSON or use comma-separated values.");
        return;
      }
    } else {
      // Fallback to comma separated
      parsedData = rawText.split(',').map(s => s.trim()).filter(s => s);
    }

    // Show loading
    loading.classList.remove('hidden');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: parsedData })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server responded with an error');
      }

      displayResults(data);

    } catch (err) {
      console.error(err);
      showError("Failed to fetch from API: " + err.message);
    } finally {
      loading.classList.add('hidden');
    }
  });

  function showError(msg) {
    errorMsg.innerText = msg;
    errorMsg.classList.remove('hidden');
  }

  function displayResults(data) {
    // Update Stats
    statTrees.innerText = data.summary.total_trees;
    statCycles.innerText = data.summary.total_cycles;
    statLargestRoot.innerText = data.summary.largest_tree_root || '-';

    // Build Trees HTML
    hierarchiesOutput.innerHTML = '';
    if (data.hierarchies && data.hierarchies.length > 0) {
      data.hierarchies.forEach(h => {
        const rootDiv = document.createElement('div');
        rootDiv.className = 'tree-node';
        rootDiv.innerHTML = buildTreeHTML(h.root, h.tree[h.root] || {}, h.has_cycle);
        hierarchiesOutput.appendChild(rootDiv);
      });
    } else {
      hierarchiesOutput.innerHTML = '<p class="text-muted">No valid hierarchies found.</p>';
    }

    // Update Lists
    invalidsOutput.innerHTML = data.invalid_entries.length 
      ? data.invalid_entries.map(e => `<span class="list-item">${e}</span>`).join('') 
      : 'None';
      
    duplicatesOutput.innerHTML = data.duplicate_edges.length 
      ? data.duplicate_edges.map(e => `<span class="list-item">${e}</span>`).join('') 
      : 'None';

    // Raw JSON
    rawJsonOutput.textContent = JSON.stringify(data, null, 2);

    // Show section
    resultsSection.classList.remove('hidden');
  }

  function buildTreeHTML(nodeName, nodeChildren, hasCycle) {
    let html = `
      <div class="tree-node-label">
        <div class="node-icon">${nodeName}</div>
        ${hasCycle ? '<span class="tag">Cycle Detected</span>' : ''}
      </div>
    `;

    const childKeys = Object.keys(nodeChildren);
    if (childKeys.length > 0) {
      html += `<div style="margin-left: 1.5rem; border-left: 1px solid var(--glass-border); padding-left: 1rem;">`;
      childKeys.forEach(child => {
        html += buildTreeHTML(child, nodeChildren[child], false);
      });
      html += `</div>`;
    }
    
    return html;
  }
});
