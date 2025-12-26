// src/tools/chores.js
let state = { t: "Weekly Chores", i: [] };

export function initChores(container, rawData) {
    if (rawData) {
        try {
            state = JSON.parse(decodeURIComponent(escape(atob(rawData))));
        } catch (e) { console.error("Hash decode failed"); }
    }

    container.innerHTML = `
        <a href="#" class="back-btn">← Back</a>
        <input type="text" id="t-in" value="${state.t}" style="font-size:2.2rem; font-weight:700; border:none; background:none; color:var(--text); width:100%; outline:none; margin-bottom:15px;">
        
        <div class="input-group" style="flex-direction: column;">
            <div style="display:flex; gap:10px;">
                <input type="text" id="chore-in" placeholder="What needs doing?" style="flex:2">
                <input type="text" id="who-in" placeholder="Who?" style="flex:1">
            </div>
            <button id="add-b" class="btn-add" style="margin-top:10px; width:100%">Add Chore</button>
        </div>

        <ul id="list-items"></ul>

        <div class="share-container">
            <button id="share-b" class="btn-share">
                <span>🔗</span> Copy Share Link
            </button>
            <p style="font-size: 0.85rem; color: #86868b; margin-top: 12px; text-align: center;">
                Send this link to share the roster.
            </p>
        </div>
    `;

    const tIn = container.querySelector('#t-in');
    const choreIn = container.querySelector('#chore-in');
    const whoIn = container.querySelector('#who-in');
    const list = container.querySelector('#list-items');

    const save = () => {
        const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(state))));
        window.location.hash = `chores:${encoded}`; // Updates the URL for sharing
    };

    const renderItems = () => {
        list.innerHTML = state.i.map((item, idx) => `
            <li class="grocery-item" data-idx="${idx}">
                <div class="item-left" style="text-decoration:${item.done ? 'line-through' : 'none'}; opacity:${item.done ? 0.4 : 1}">
                    <input type="checkbox" ${item.done ? 'checked' : ''}>
                    <div style="display:flex; flex-direction:column;">
                        <span style="font-weight:600;">${item.task}</span>
                        <span style="font-size:0.8rem; color:var(--accent);">${item.who ? '👤 ' + item.who : 'Unassigned'}</span>
                    </div>
                </div>
                <button class="delete-btn">&times;</button>
            </li>
        `).join('');
    };

    tIn.oninput = (e) => { state.t = e.target.value; save(); };
    
    container.querySelector('#add-b').onclick = () => {
        if (!choreIn.value.trim()) return;
        state.i.push({ task: choreIn.value, who: whoIn.value, done: false });
        choreIn.value = '';
        whoIn.value = '';
        save();
        renderItems();
    };

    container.querySelector('#share-b').onclick = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            const btn = container.querySelector('#share-b');
            const originalText = btn.innerHTML;
            btn.innerHTML = "✅ Link Copied!";
            setTimeout(() => btn.innerHTML = originalText, 2000);
        });
    };

    list.onclick = (e) => {
        const li = e.target.closest('.grocery-item');
        if (!li) return;
        const idx = li.dataset.idx;

        if (e.target.classList.contains('delete-btn')) {
            state.i.splice(idx, 1);
        } else {
            state.i[idx].done = !state.i[idx].done;
        }
        save();
        renderItems();
    };

    renderItems();
}