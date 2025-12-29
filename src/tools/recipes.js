// src/tools/recipes.js
import { loadState, saveState, escapeHTML, initShareButtons } from '../utils.js';

let state;
let isEditing = true;
let scaleFactor = 1;

export function initRecipes(container, rawData) {
    state = loadState(rawData, { t: "New Recipe", m: { p: "", s: "" }, i: "", d: "" });
    if (state.b !== undefined) { state.d = state.b; delete state.b; }
    
    isEditing = !rawData;
    scaleFactor = 1; // Reset scale on load
    render(container);
}

function render(container) {
    if (isEditing) renderEditor(container);
    else renderViewer(container);
}

function renderEditor(container) {
    container.innerHTML = `
        <div class="top-bar">
            <a href="#" class="back-btn" style="margin:0">← Back</a>
            <button id="view-btn" class="toggle-btn">👁️ Preview</button>
        </div>

        <input type="text" id="t-in" value="${escapeHTML(state.t)}" placeholder="Recipe Title" 
               style="font-size:2rem; font-weight:700; border:none; background:none; color:var(--text); width:100%; outline:none; margin-bottom:15px;">
        
        <div class="recipe-meta">
            <input type="text" id="p-in" value="${escapeHTML(state.m.p || '')}" placeholder="Prep Time" class="meta-pill">
            <input type="text" id="s-in" value="${escapeHTML(state.m.s || '')}" placeholder="Servings" class="meta-pill">
        </div>

        <div class="section-label">Ingredients (One per line)</div>
        <textarea id="i-in" style="height:150px; width:100%; padding:15px; border-radius:12px; border:1px solid var(--border); background:var(--input-bg); color:var(--text); font-family:inherit;">${escapeHTML(state.i)}</textarea>

        <div class="section-label">Directions</div>
        <textarea id="d-in" style="height:250px; width:100%; padding:15px; border-radius:12px; border:1px solid var(--border); background:var(--input-bg); color:var(--text); font-family:inherit;">${escapeHTML(state.d)}</textarea>
        
        <div id="share-root"></div>
    `;

    initShareButtons(container.querySelector('#share-root'));

    const update = () => saveState('recipes', state);
    container.querySelector('#t-in').oninput = (e) => { state.t = e.target.value; update(); };
    container.querySelector('#i-in').oninput = (e) => { state.i = e.target.value; update(); };
    container.querySelector('#d-in').oninput = (e) => { state.d = e.target.value; update(); };
    container.querySelector('#p-in').oninput = (e) => { state.m.p = e.target.value; update(); };
    container.querySelector('#s-in').oninput = (e) => { state.m.s = e.target.value; update(); };

    container.querySelector('#view-btn').onclick = () => { isEditing = false; update(); render(container); };
}

// Helper to scale numbers in a string
function scaleString(str, factor) {
    if (factor === 1) return escapeHTML(str);
    
    // Regex matches integers and decimals (e.g. 1, 1.5, 0.5)
    // Does not handle fractions like "1/2" perfectly unless converted to decimals first, 
    // but this covers 90% of cases.
    return escapeHTML(str).replace(/\b(\d+(\.\d+)?)\b/g, (match) => {
        const num = parseFloat(match);
        if (isNaN(num)) return match;
        // Format to remove trailing zeros (e.g. 3.0 -> 3)
        return parseFloat((num * factor).toFixed(2));
    });
}

function renderViewer(container) {
    const ingredients = state.i ? state.i.split('\n').filter(l => l.trim()) : [];
    const directions = state.d ? state.d.split('\n').filter(l => l.trim()) : [];

    container.innerHTML = `
        <div class="top-bar">
            <a href="#" class="back-btn" style="margin:0">← Back</a>
            <div style="display:flex; gap:5px; align-items:center;">
                <span style="font-size:0.8rem; color:var(--accent); font-weight:600;">Scale:</span>
                <button class="scale-btn ${scaleFactor===1?'active':''}" data-val="1">1x</button>
                <button class="scale-btn ${scaleFactor===2?'active':''}" data-val="2">2x</button>
                <button class="scale-btn ${scaleFactor===3?'active':''}" data-val="3">3x</button>
            </div>
            <button id="edit-btn" class="toggle-btn" style="margin-left:15px;">✏️ Edit</button>
        </div>

        <div class="cook-view">
            <h1>${escapeHTML(state.t)}</h1>
            <div class="recipe-meta">
                ${state.m.p ? `<div class="meta-pill">⏱️ ${escapeHTML(state.m.p)}</div>` : ''}
                ${state.m.s ? `<div class="meta-pill">👥 ${scaleString(state.m.s, scaleFactor)}</div>` : ''}
            </div>

            ${ingredients.length > 0 ? `<div class="section-label">Ingredients</div>` : ''}
            <div>
                ${ingredients.map(ing => `
                    <div class="ingredient-item">
                        <span style="font-size:1.2rem; color:var(--accent);">○</span>
                        <span>${scaleString(ing, scaleFactor)}</span>
                    </div>
                `).join('')}
            </div>

            ${directions.length > 0 ? `<div class="section-label" style="margin-top:30px">Directions</div>` : ''}
            <div>
                ${directions.map((step, i) => `
                    <div class="direction-step">
                        <span class="step-num">${i + 1}.</span>
                        <span>${escapeHTML(step)}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <style>
            .scale-btn {
                background: var(--card-bg); border: 1px solid var(--border);
                padding: 4px 8px; border-radius: 6px; font-size: 0.8rem; cursor: pointer;
            }
            .scale-btn.active { background: var(--accent); color: white; border-color: var(--accent); }
        </style>
    `;

    container.querySelectorAll('.ingredient-item').forEach(el => el.onclick = () => el.classList.toggle('ing-done'));
    container.querySelectorAll('.direction-step').forEach(el => el.onclick = () => el.classList.toggle('step-done'));
    container.querySelector('#edit-btn').onclick = () => { isEditing = true; render(container); };

    container.querySelectorAll('.scale-btn').forEach(btn => {
        btn.onclick = () => {
            scaleFactor = parseInt(btn.dataset.val);
            renderViewer(container);
        };
    });
}