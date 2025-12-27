import { loadState, saveState, escapeHTML, initShareButtons } from '../utils.js';

let state;

export function initPacking(container, rawData) {
    state = loadState(rawData, { t: "Packing List", i: [] });
    
    container.innerHTML = `
        <a href="#" class="back-btn">← Back</a>
        
        <input type="text" id="t-in" value="${escapeHTML(state.t)}" 
            style="font-size:2.2rem; font-weight:700; border:none; background:none; color:var(--text); width:100%; outline:none; margin-bottom:15px;">
        
        <form id="add-form" class="input-group">
            <input type="text" id="item-input" placeholder="Item name..." required>
            <input type="number" id="qty-input" value="1" min="1" style="width: 60px;">
            <button type="submit" class="btn-add">Add</button>
        </form>

        <ul id="list-items"></ul>
        <div id="share-root"></div>
    `;

    initShareButtons(container.querySelector('#share-root'));

    const renderList = () => {
        const list = container.querySelector('#list-items');
        list.innerHTML = state.i.map((item, idx) => `
            <li class="packing-item">
                <div class="item-left" style="opacity:${item.done ? 0.4 : 1}; text-decoration:${item.done ? 'line-through' : 'none'}">
                    <input type="checkbox" data-idx="${idx}" ${item.done ? 'checked' : ''}>
                    <span>${escapeHTML(item.name)} <small>(x${item.qty})</small></span>
                </div>
                <button class="delete-btn" data-idx="${idx}">&times;</button>
            </li>
        `).join('');
        
        list.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.onchange = () => { state.i[cb.dataset.idx].done = cb.checked; save(); renderList(); };
        });
        list.querySelectorAll('.delete-btn').forEach(btn => {
            btn.onclick = () => { state.i.splice(btn.dataset.idx, 1); save(); renderList(); };
        });
    };

    const save = () => saveState('packing', state);

    container.querySelector('#t-in').oninput = (e) => { state.t = e.target.value; save(); };

    container.querySelector('#add-form').onsubmit = (e) => {
        e.preventDefault();
        const name = container.querySelector('#item-input').value;
        const qty = container.querySelector('#qty-input').value;
        state.i.push({ name, qty, done: false });
        container.querySelector('#item-input').value = '';
        save();
        renderList();
    };
    
    renderList();
}