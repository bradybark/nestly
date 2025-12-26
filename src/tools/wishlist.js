// src/tools/wishlist.js

let state = {
    t: "My Wishlist", // Title
    i: []             // Items: { n: Name, p: Price, l: Link, d: Note }
};

let isEditing = true;

export function initWishlist(container, rawData) {
    if (rawData) {
        try {
            state = JSON.parse(decodeURIComponent(escape(atob(rawData))));
            isEditing = false;
        } catch (e) { console.error("Hash decode failed"); }
    } else {
        isEditing = true;
    }
    render(container);
}

function save() {
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(state))));
    history.replaceState(null, null, '#wishlist:' + encoded);
}

function render(container) {
    if (isEditing) renderEditor(container);
    else renderViewer(container);
}

// --- EDITOR MODE ---
function renderEditor(container) {
    container.innerHTML = `
        <div class="top-bar">
            <a href="#" class="back-btn" style="margin:0">← Back</a>
            <button id="view-btn" class="toggle-btn">👁️ Preview</button>
        </div>

        <input type="text" id="t-in" value="${state.t}" placeholder="List Title (e.g. Tom's Birthday)" 
               style="font-size:2rem; font-weight:700; border:none; background:none; color:var(--text); width:100%; outline:none; margin-bottom:20px;">
        
        <div class="section-label">Add New Item</div>
        <div style="background:var(--card-bg); padding:15px; border-radius:12px; margin-bottom:20px; border:1px solid var(--border);">
            <div style="display:flex; gap:10px; margin-bottom:10px;">
                <input type="text" id="n-in" placeholder="Item Name" style="flex:2; padding:12px; border-radius:8px; border:1px solid var(--border);">
                <input type="text" id="p-in" placeholder="Price" style="flex:1; padding:12px; border-radius:8px; border:1px solid var(--border);">
            </div>
            <input type="text" id="l-in" placeholder="Paste Link (https://...)" style="width:100%; padding:12px; border-radius:8px; border:1px solid var(--border); margin-bottom:10px; box-sizing:border-box;">
            <input type="text" id="d-in" placeholder="Notes (Size, Color, etc.)" style="width:100%; padding:12px; border-radius:8px; border:1px solid var(--border); margin-bottom:10px; box-sizing:border-box;">
            <button id="add-btn" class="btn-add" style="width:100%;">+ Add to List</button>
        </div>

        <div class="section-label">Current Items</div>
        <div id="item-list"></div>

        <div class="share-container">
            <button id="share-b" class="btn-share"><span>🔗</span> Copy List Link</button>
            <p style="font-size: 0.85rem; color: #86868b; margin-top: 12px; text-align: center;">Send this link to family & friends.</p>
        </div>
    `;

    // Bind Title
    container.querySelector('#t-in').oninput = (e) => { state.t = e.target.value; save(); };

    // Render List
    const listEl = container.querySelector('#item-list');
    const renderList = () => {
        listEl.innerHTML = state.i.map((item, idx) => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid var(--border);">
                <div>
                    <div style="font-weight:600;">${item.n}</div>
                    <div style="font-size:0.85rem; color:#86868b;">${item.p} ${item.d ? ' • ' + item.d : ''}</div>
                </div>
                <button class="del-btn" data-idx="${idx}" style="background:none; border:none; color:var(--danger); font-size:1.2rem; cursor:pointer;">&times;</button>
            </div>
        `).join('');

        listEl.querySelectorAll('.del-btn').forEach(btn => {
            btn.onclick = () => {
                state.i.splice(btn.dataset.idx, 1);
                save();
                renderList();
            };
        });
    };
    renderList();

    // Add Item Logic
    container.querySelector('#add-btn').onclick = () => {
        const n = container.querySelector('#n-in').value;
        const p = container.querySelector('#p-in').value;
        const l = container.querySelector('#l-in').value;
        const d = container.querySelector('#d-in').value;

        if (!n) return;

        state.i.push({ n, p, l, d });
        
        // Clear inputs
        container.querySelector('#n-in').value = '';
        container.querySelector('#p-in').value = '';
        container.querySelector('#l-in').value = '';
        container.querySelector('#d-in').value = '';
        
        save();
        renderList();
    };

    container.querySelector('#view-btn').onclick = () => { isEditing = false; save(); render(container); };
    container.querySelector('#share-b').onclick = () => {
        navigator.clipboard.writeText(window.location.href);
        const btn = container.querySelector('#share-b');
        btn.innerHTML = "✅ Copied!";
        setTimeout(() => btn.innerHTML = "<span>🔗</span> Copy List Link", 2000);
    };
}

// --- VIEWER MODE ---
function renderViewer(container) {
    container.innerHTML = `
        <div class="top-bar">
            <a href="#" class="back-btn" style="margin:0">← Back</a>
            <button id="edit-btn" class="toggle-btn">✏️ Edit</button>
        </div>

        <h1 style="margin-bottom:30px; font-size:2.5rem; text-align:center;">${state.t}</h1>

        <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(100%, 1fr)); gap:15px;">
            ${state.i.map(item => `
                <div style="background:var(--card-bg); padding:20px; border-radius:16px; border:1px solid var(--border); position:relative;">
                    <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:10px;">
                        <div style="font-size:1.2rem; font-weight:700;">${item.n}</div>
                        ${item.p ? `<div style="background:var(--bg); padding:5px 10px; border-radius:8px; font-weight:600; font-size:0.9rem;">${item.p}</div>` : ''}
                    </div>
                    
                    ${item.d ? `<div style="color:var(--text); opacity:0.8; margin-bottom:15px; font-size:0.95rem;">${item.d}</div>` : ''}
                    
                    ${item.l ? `
                        <a href="${item.l}" target="_blank" style="display:block; text-align:center; background:var(--accent); color:white; text-decoration:none; padding:10px; border-radius:10px; font-weight:600; font-size:0.9rem;">
                            View Item ↗
                        </a>
                    ` : ''}
                </div>
            `).join('')}
        </div>
        
        ${state.i.length === 0 ? '<p style="text-align:center; color:#86868b;">No items on the wishlist yet.</p>' : ''}
    `;

    container.querySelector('#edit-btn').onclick = () => { isEditing = true; render(container); };
}