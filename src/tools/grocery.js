// src/tools/grocery.js
import { loadState, saveState, escapeHTML, copyLink, showQR } from '../utils.js';

let state;

export function initGrocery(container, rawData) {
    state = loadState(rawData, { t: "Grocery List", i: [] });

    container.innerHTML = `
        <a href="#" class="back-btn">← Back</a>
        <input type="text" id="t-in" value="${escapeHTML(state.t)}" style="font-size:2.2rem; font-weight:700; border:none; background:none; color:var(--text); width:100%; outline:none; margin-bottom:15px;">
        
        <div class="input-group">
            <input type="text" id="i-in" placeholder="Add something..." autofocus>
            <button id="add-b" class="btn-add">Add</button>
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
                    <span>${escapeHTML(item.text)}</span>
                </div>
                <button class="delete-btn">&times;</button>
            </li>
        `).join('');
    };

    const update = () => saveState('grocery', state);

    container.querySelector('#t-in').oninput = (e) => { state.t = e.target.value; update(); };
    
    container.querySelector('#add-b').onclick = () => {
        const iIn = container.querySelector('#i-in');
        if (!iIn.value.trim()) return;
        state.i.push({ text: iIn.value, done: false });
        iIn.value = '';
        update();
        renderItems();
    };

    container.querySelector('#i-in').onkeypress = (e) => {
        if (e.key === 'Enter') container.querySelector('#add-b').click();
    };

    // Share buttons
    container.querySelector('#share-b').onclick = (e) => copyLink(e.currentTarget);
    container.querySelector('#qr-b').onclick = () => showQR();

    container.querySelector('#list-items').onclick = (e) => {
        const li = e.target.closest('.grocery-item');
        if (!li) return;
        const idx = li.dataset.idx;

        if (e.target.classList.contains('delete-btn')) {
            state.i.splice(idx, 1);
        } else if (e.target.tagName === 'INPUT') { // Checkbox
            state.i[idx].done = !state.i[idx].done;
        } else if (e.target.closest('.item-left')) { // Click on text
             const cb = li.querySelector('input[type="checkbox"]');
             cb.checked = !cb.checked;
             state.i[idx].done = cb.checked;
        }
        update();
        renderItems();
    };

    renderItems();
}