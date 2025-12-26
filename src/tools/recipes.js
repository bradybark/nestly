// src/tools/recipes.js

// Data Structure:
// t: Title
// m: Metadata { p: Prep Time, s: Servings }
// i: Ingredients (string, newlines)
// d: Directions (string, newlines)
let state = {
    t: "New Recipe",
    m: { p: "", s: "" },
    i: "", 
    d: ""  
};

let isEditing = true; 

export function initRecipes(container, rawData) {
    // 1. Load Data
    if (rawData) {
        try {
            const decoded = JSON.parse(decodeURIComponent(escape(atob(rawData))));
            
            // Backward compatibility for older versions
            if (decoded.b !== undefined) {
                state.t = decoded.t;
                state.d = decoded.b;
            } else {
                state = decoded;
            }
            
            // If loading from a link, start in View Mode
            isEditing = false; 
        } catch (e) { console.error("Hash decode failed"); }
    } else {
        // If new, start in Edit Mode
        isEditing = true;
    }

    render(container);
}

function save() {
    // Encodes state to Base64
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(state))));
    const newHash = `recipes:${encoded}`;
    
    // Updates URL silently without reloading the page (Fixes the "typing glitch")
    history.replaceState(null, null, '#' + newHash);
}

function render(container) {
    if (isEditing) {
        renderEditor(container);
    } else {
        renderViewer(container);
    }
}

// --- EDITOR MODE (Writing the recipe) ---
function renderEditor(container) {
    container.innerHTML = `
        <div class="top-bar">
            <a href="#" class="back-btn" style="margin:0">← Back</a>
            <button id="view-btn" class="toggle-btn">👁️ Preview</button>
        </div>

        <input type="text" id="t-in" value="${state.t}" placeholder="Recipe Title" 
               style="font-size:2rem; font-weight:700; border:none; background:none; color:var(--text); width:100%; outline:none; margin-bottom:15px;">
        
        <div class="recipe-meta">
            <input type="text" id="p-in" value="${state.m.p || ''}" placeholder="Prep Time" class="meta-pill" style="text-align:left;">
            <input type="text" id="s-in" value="${state.m.s || ''}" placeholder="Servings" class="meta-pill" style="text-align:left;">
        </div>

        <div class="section-label">Ingredients (One per line)</div>
        <textarea id="i-in" placeholder="• 2 cups Flour..." style="height:150px; width:100%; padding:15px; border-radius:12px; border:1px solid var(--border); background:var(--card-bg); color:var(--text); font-family:inherit; font-size:1rem; resize:vertical;">${state.i}</textarea>

        <div class="section-label">Directions</div>
        <textarea id="d-in" placeholder="1. Preheat oven..." style="height:250px; width:100%; padding:15px; border-radius:12px; border:1px solid var(--border); background:var(--card-bg); color:var(--text); font-family:inherit; font-size:1rem; resize:vertical;">${state.d}</textarea>

        <div class="share-container">
            <button id="share-b" class="btn-share"><span>🔗</span> Copy Recipe Link</button>
            <p style="font-size: 0.85rem; color: #86868b; margin-top: 12px; text-align: center;">Save your changes by copying the link!</p>
        </div>
    `;

    // Bind Inputs using 'input' for real-time saving
    const attach = (id, key, subKey) => {
        const el = container.querySelector(id);
        el.oninput = (e) => {
            if (subKey) state[key][subKey] = e.target.value;
            else state[key] = e.target.value;
            save();
        };
    };

    attach('#t-in', 't');
    attach('#i-in', 'i');
    attach('#d-in', 'd');
    attach('#p-in', 'm', 'p');
    attach('#s-in', 'm', 's');

    container.querySelector('#view-btn').onclick = () => {
        isEditing = false;
        save(); 
        render(container);
    };

    container.querySelector('#share-b').onclick = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            const btn = container.querySelector('#share-b');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = "✅ Link Copied!";
            setTimeout(() => btn.innerHTML = originalHTML, 2000);
        });
    };
}

// --- COOK MODE (Viewing and Checking off steps) ---
function renderViewer(container) {
    const ingredients = state.i ? state.i.split('\n').filter(line => line.trim()) : [];
    const directions = state.d ? state.d.split('\n').filter(line => line.trim()) : [];

    container.innerHTML = `
        <div class="top-bar">
            <a href="#" class="back-btn" style="margin:0">← Back</a>
            <button id="edit-btn" class="toggle-btn">✏️ Edit</button>
        </div>

        <div class="cook-view">
            <h1>${state.t}</h1>
            
            <div class="recipe-meta">
                ${state.m.p ? `<div class="meta-pill">⏱️ ${state.m.p}</div>` : ''}
                ${state.m.s ? `<div class="meta-pill">👥 ${state.m.s}</div>` : ''}
            </div>

            ${ingredients.length > 0 ? `<div class="section-label">Ingredients</div>` : ''}
            <div id="ing-list">
                ${ingredients.map(ing => `
                    <div class="ingredient-item">
                        <span style="font-size:1.2rem; color:var(--accent);">○</span>
                        <span>${ing}</span>
                    </div>
                `).join('')}
            </div>

            ${directions.length > 0 ? `<div class="section-label" style="margin-top:30px">Directions</div>` : ''}
            <div id="dir-list">
                ${directions.map((step, i) => `
                    <div class="direction-step">
                        <span class="step-num">${i + 1}.</span>
                        <span>${step}</span>
                    </div>
                `).join('')}
            </div>

            <div style="margin-top: 40px; text-align: center; color: #86868b; font-size: 0.8rem;">
                Tip: Tap ingredients and steps to cross them off!
            </div>
        </div>
    `;

    // Interactive Logic (Toggle visual state only)
    
    // 1. Ingredients
    const ingItems = container.querySelectorAll('.ingredient-item');
    ingItems.forEach(item => {
        item.onclick = () => item.classList.toggle('ing-done');
    });

    // 2. Directions
    const dirItems = container.querySelectorAll('.direction-step');
    dirItems.forEach(item => {
        item.onclick = () => item.classList.toggle('step-done');
    });

    container.querySelector('#edit-btn').onclick = () => {
        isEditing = true;
        render(container);
    };
}