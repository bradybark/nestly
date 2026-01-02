// src/tools/recipes.js
import { loadState, saveState, escapeHTML, initShareButtons } from '../utils.js';

let state;
let isEditing = true;
let scaleFactor = 1;

export function initRecipes(container, rawData) {
    // Default state now uses an array for 'i' (ingredients)
    state = loadState(rawData, { t: "New Recipe", m: { p: "", s: "" }, i: [], d: "" });
    
    // Handle legacy data (if 'i' is a string from old version)
    migrateOldData();

    // Check if migrating from very old structure (b -> d)
    if (state.b !== undefined) { state.d = state.b; delete state.b; }
    
    isEditing = !rawData;
    scaleFactor = 1;
    render(container);
}

function migrateOldData() {
    if (typeof state.i === 'string') {
        // Convert old text block to array of objects
        const lines = state.i.split('\n').filter(l => l.trim());
        state.i = lines.map(line => {
            // Simple heuristic to separate amount from text
            // Looks for leading numbers (e.g. "1.5 cup flour")
            const match = line.match(/^([\d\./]+)\s*(.*)/);
            if (match) {
                return { a: match[1], u: '', n: match[2] };
            }
            return { a: '', u: '', n: line };
        });
    }
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

        <div class="section-label">Ingredients</div>
        <div id="ing-list" style="margin-bottom:15px;"></div>
        <button id="add-ing" class="btn-share" style="width:100%; justify-content:center; margin-bottom:20px;">+ Add Ingredient</button>

        <div class="section-label">Directions</div>
        <textarea id="d-in" style="height:250px; width:100%; padding:15px; border-radius:12px; border:1px solid var(--border); background:var(--input-bg); color:var(--text); font-family:inherit;">${escapeHTML(state.d)}</textarea>
        
        <div id="share-root"></div>
    `;

    initShareButtons(container.querySelector('#share-root'));

    const update = () => saveState('recipes', state);
    
    // Title & Meta inputs
    container.querySelector('#t-in').oninput = (e) => { state.t = e.target.value; update(); };
    container.querySelector('#d-in').oninput = (e) => { state.d = e.target.value; update(); };
    container.querySelector('#p-in').oninput = (e) => { state.m.p = e.target.value; update(); };
    container.querySelector('#s-in').oninput = (e) => { state.m.s = e.target.value; update(); };

    // Ingredient Editor Logic
    const renderIngInputs = () => {
        const list = container.querySelector('#ing-list');
        list.innerHTML = state.i.map((item, idx) => `
            <div style="display:flex; gap:8px; margin-bottom:8px;">
                <input type="text" class="i-a" data-idx="${idx}" value="${escapeHTML(item.a || '')}" placeholder="#" style="flex:1; min-width:40px;">
                <input type="text" class="i-u" data-idx="${idx}" value="${escapeHTML(item.u || '')}" placeholder="Unit" style="flex:2; min-width:60px;">
                <input type="text" class="i-n" data-idx="${idx}" value="${escapeHTML(item.n || '')}" placeholder="Item" style="flex:6;">
                <button class="del-ing" data-idx="${idx}" style="background:none; border:none; color:var(--danger); cursor:pointer; font-size:1.2rem;">&times;</button>
            </div>
        `).join('');

        // Attach listeners
        list.querySelectorAll('.i-a').forEach(el => el.oninput = (e) => { state.i[el.dataset.idx].a = e.target.value; update(); });
        list.querySelectorAll('.i-u').forEach(el => el.oninput = (e) => { state.i[el.dataset.idx].u = e.target.value; update(); });
        list.querySelectorAll('.i-n').forEach(el => el.oninput = (e) => { state.i[el.dataset.idx].n = e.target.value; update(); });
        list.querySelectorAll('.del-ing').forEach(el => el.onclick = (e) => { 
            state.i.splice(e.target.dataset.idx, 1); 
            update(); 
            renderIngInputs(); 
        });
    };
    renderIngInputs();

    container.querySelector('#add-ing').onclick = () => {
        state.i.push({ a: '', u: '', n: '' });
        update();
        renderIngInputs();
    };

    container.querySelector('#view-btn').onclick = () => { isEditing = false; update(); render(container); };
}

function scaleAmount(amountStr, factor) {
    if (factor === 1 || !amountStr) return escapeHTML(amountStr);
    
    // Try to parse fraction (e.g. "1/2") or decimal
    try {
        let num;
        if (amountStr.includes('/')) {
            const [n, d] = amountStr.split('/');
            num = parseFloat(n) / parseFloat(d);
        } else {
            num = parseFloat(amountStr);
        }

        if (isNaN(num)) return escapeHTML(amountStr); // Fallback if not a number

        const scaled = num * factor;
        
        // Format nicely (avoid 1.50000001)
        return parseFloat(scaled.toFixed(2));
    } catch (e) {
        return escapeHTML(amountStr);
    }
}

function renderViewer(container) {
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
                ${state.m.s ? `<div class="meta-pill">👥 ${escapeHTML(state.m.s)}</div>` : ''}
            </div>

            ${state.i.length > 0 ? `<div class="section-label">Ingredients</div>` : ''}
            <div>
                ${state.i.map(ing => `
                    <div class="ingredient-item">
                        <span style="font-size:1.2rem; color:var(--accent); margin-right:10px;">○</span>
                        <span style="font-weight:700; margin-right:4px;">${scaleAmount(ing.a, scaleFactor)}</span>
                        <span style="font-style:italic; margin-right:6px;">${escapeHTML(ing.u)}</span>
                        <span>${escapeHTML(ing.n)}</span>
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
            .i-a, .i-u, .i-n { padding: 10px !important; } /* Smaller padding for ingredient inputs */
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