import { loadState, saveState, escapeHTML, initShareButtons } from '../utils.js';

let state;
let isEditing = true;

export function initWishlist(container, rawData) {
    state = loadState(rawData, { t: "My Wishlist", i: [] });
    isEditing = !rawData; 
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

        <input type="text" id="t-in" value="${escapeHTML(state.t)}" placeholder="List Title" 
               style="font-size:2rem; font-weight:700; border:none; background:none; color:var(--text); width:100%; outline:none; margin-bottom:20px;">
        
        <div class="section-label">Add New Item</div>
        <div style="margin-bottom:20px;">
            <div style="display:flex; gap:10px; margin-bottom:10px;">
                <input type="text" id="n-in" placeholder="Item Name" style="flex:3;">
                <input type="text" id="p-in" placeholder="Price" style="flex:1;">
            </div>
            <input type="text" id="l-in" placeholder="Paste Link (https://...)" style="width:100%; margin-bottom:10px; box-sizing:border-box;">
            <input type="text" id="d-in" placeholder="Notes (Size, Color...)" style="width:100%; margin-bottom:10px; box-sizing:border-box;">
            <button id="add-btn" class="btn-add" style="width:100%;">+ Add to List</button>
        </div>

        <div class="section-label">Current Items</div>
        <div id="item-list"></div>
        <div id="share-root"></div>
    `;

    initShareButtons(container.querySelector('#share-root'));

    container.querySelector('#t-in').oninput = (e) => { state.t = e.target.value; saveState('wishlist', state); };
    container.querySelector('#view-btn').onclick = () => { isEditing = false; saveState('wishlist', state); render(container); };
    
    const renderList = () => {
        container.querySelector('#item-list').innerHTML = state.i.map((item, idx) => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid var(--border);">
                <div>
                    <div style="font-weight:600;">${escapeHTML(item.n)}</div>
                    <div style="font-size:0.85rem; color:#86868b;">${escapeHTML(item.p)}</div>
                </div>
                <button class="del-btn" data-idx="${idx}">&times;</button>
            </div>
        `).join('');

        container.querySelectorAll('.del-btn').forEach(btn => {
            btn.onclick = () => { state.i.splice(btn.dataset.idx, 1); saveState('wishlist', state); renderList(); };
        });
    };
    renderList();

    container.querySelector('#add-btn').onclick = () => {
        const n = container.querySelector('#n-in').value;
        if (!n) return;
        state.i.push({
            n,
            p: container.querySelector('#p-in').value,
            l: container.querySelector('#l-in').value,
            d: container.querySelector('#d-in').value
        });
        saveState('wishlist', state);
        render(container);
    };
}

function renderViewer(container) {
    container.innerHTML = `
        <div class="top-bar">
            <a href="#" class="back-btn" style="margin:0">← Back</a>
            <button id="edit-btn" class="toggle-btn">✏️ Edit</button>
        </div>

        <h1 style="margin-bottom:30px; font-size:2.5rem; text-align:center;">${escapeHTML(state.t)}</h1>

        <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(100%, 1fr)); gap:15px;">
            ${state.i.map(item => `
                <div style="background:var(--card-bg); padding:20px; border-radius:16px; border:1px solid var(--border);">
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                        <div style="font-size:1.2rem; font-weight:700;">${escapeHTML(item.n)}</div>
                        ${item.p ? `<div style="background:var(--bg); padding:5px 10px; border-radius:8px; font-weight:600;">${escapeHTML(item.p)}</div>` : ''}
                    </div>
                    ${item.d ? `<div style="opacity:0.8; margin-bottom:15px;">${escapeHTML(item.d)}</div>` : ''}
                    ${item.l ? `<a href="${escapeHTML(item.l)}" target="_blank" style="display:block; text-align:center; background:var(--accent); color:white; text-decoration:none; padding:10px; border-radius:10px;">View Item ↗</a>` : ''}
                </div>
            `).join('')}
        </div>
    `;
    container.querySelector('#edit-btn').onclick = () => { isEditing = true; render(container); };
}