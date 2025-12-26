// src/tools/chores.js
import { loadState, saveState, escapeHTML, copyLink, showQR } from '../utils.js';

let state;

export function initChores(container, rawData) {
    state = loadState(rawData, { t: "Weekly Chores", i: [] });

    container.innerHTML = `
        <a href="#" class="back-btn">← Back</a>
        <input type="text" id="t-in" value="${escapeHTML(state.t)}" style="font-size:2.2rem; font-weight:700; border:none; background:none; color:var(--text); width:100%; outline:none; margin-bottom:15px;">
        
        <div class="input-group" style="flex-direction: column;">
            <div style="display:flex; gap:10px;">
                <input type="text" id="chore-in" placeholder="What needs doing?" style="flex:2">
                <input type="text" id="who-in" placeholder="Who?" style="flex:1">
            </div>
            <button id="add-b" class="btn-add" style="margin-top:10px; width:100%">Add Chore</button>
        </div>

        <ul id="list-items"></ul>

        <div class="share-container">
            <button id="share-b" class="btn-share"><span>🔗</span> Copy Link</button>
            <button id="qr-b" class="btn-share"><span>🏁</span> QR Code</button>
        </div>
    `;

    const renderItems = () => {
        container.querySelector('#list-items').innerHTML = state.i.map((item, idx) => `
            <li class="grocery-item" data-idx="${idx}">
                <div class="item-left" style="text-decoration:${item.done ? 'line-through' : 'none'}; opacity:${item.done ? 0.4 : 1}">
                    <input type="checkbox" ${item.done ? 'checked' : ''}>
                    <div style="display:flex; flex-direction:column;">
                        <span style="font-weight:600;">${escapeHTML(item.task)}</span>
                        <span style="font-size:0.8rem; color:var(--accent);">${item.who ? '👤 ' + escapeHTML(item.who) : 'Unassigned'}</span>
                    </div>
                </div>
                <button class="delete-btn">&times;</button>
            </li>
        `).join('');
    };

    const update = () => saveState('chores', state);

    container.querySelector('#t-in').oninput = (e) => { state.t = e.target.value; update(); };
    
    container.querySelector('#add-b').onclick = () => {
        const choreIn = container.querySelector('#chore-in');
        const whoIn = container.querySelector('#who-in');
        
        if (!choreIn.value.trim()) return;
        state.i.push({ task: choreIn.value, who: whoIn.value, done: false });
        choreIn.value = '';
        whoIn.value = '';
        update();
        renderItems();
    };

    container.querySelector('#share-b').onclick = (e) => copyLink(e.currentTarget);
    container.querySelector('#qr-b').onclick = () => showQR();

    container.querySelector('#list-items').onclick = (e) => {
        const li = e.target.closest('li');
        if (!li) return;
        const idx = li.dataset.idx;

        if (e.target.classList.contains('delete-btn')) {
            state.i.splice(idx, 1);
        } else {
            // Toggle check
            state.i[idx].done = !state.i[idx].done;
        }
        update();
        renderItems();
    };

    renderItems();
}