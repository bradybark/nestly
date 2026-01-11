import { loadState, saveState, escapeHTML, initShareButtons, refreshIcons } from '../utils.js';

export function initGenericList(container, rawData, config) {
    const state = loadState(rawData, { t: config.defaultTitle, i: [] });

    container.innerHTML = `
        <a href="#" class="back-btn"><i data-lucide="arrow-left"></i> Back</a>

        <input type="text" id="t-in" value="${escapeHTML(state.t)}"
            class="font-display" style="font-size:2.2rem; font-weight:700; border:none; background:none; color:var(--text); width:100%; outline:none; margin-bottom:15px;">

        <div class="input-group" style="${config.columnInput ? 'flex-direction:column;' : ''}">
            ${config.inputHTML}
            <button id="add-b" class="btn-add" style="${config.columnInput ? 'margin-top:10px; width:100%' : ''}">Add</button>
        </div>

        <ul id="list-items"></ul>

        <div style="margin-top:10px; text-align:right;">
             <button id="clear-done" class="nav-link-underline" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:0.9rem; font-family:var(--font-mono);">Clear Completed</button>
        </div>

        <div id="share-root"></div>
    `;

    initShareButtons(container.querySelector('#share-root'));
    refreshIcons();

    const update = () => saveState(config.toolId, state);

    const renderItems = () => {
        const list = container.querySelector('#list-items');
        if (state.i.length === 0) {
            list.innerHTML = `<li style="text-align:center; color:var(--text-muted); justify-content:center; font-family:var(--font-mono);">List is empty</li>`;
            return;
        }

        list.innerHTML = state.i.map((item, idx) => `
            <li class="list-item" data-idx="${idx}">
                <div class="item-left" style="opacity:${item.done ? 0.4 : 1}; text-decoration:${item.done ? 'line-through' : 'none'}">
                    <input type="checkbox" ${item.done ? 'checked' : ''}>
                    ${config.renderItem(item)}
                </div>
                <div class="actions">
                    <button class="move-btn" data-dir="up" data-idx="${idx}" title="Move Up"><i data-lucide="arrow-up" style="width:14px; height:14px;"></i></button>
                    <button class="move-btn" data-dir="down" data-idx="${idx}" title="Move Down"><i data-lucide="arrow-down" style="width:14px; height:14px;"></i></button>
                    <button class="delete-btn" data-idx="${idx}"><i data-lucide="x" style="width:14px; height:14px;"></i></button>
                </div>
            </li>
        `).join('');
        refreshIcons();
    };

    // --- Event Handlers ---

    // Title Edit
    container.querySelector('#t-in').oninput = (e) => { state.t = e.target.value; update(); };

    // Add Item
    const addItem = () => {
        const item = config.createItem(container);
        if (!item) return; // Validation failed
        state.i.push(item);
        update();
        renderItems();
        // Focus back on first input
        container.querySelector('input').focus(); 
    };

    container.querySelector('#add-b').onclick = addItem;
    // Allow 'Enter' to submit on inputs
    container.querySelectorAll('.input-group input').forEach(input => {
        input.onkeypress = (e) => { if (e.key === 'Enter') addItem(); };
    });

    // Clear Completed
    container.querySelector('#clear-done').onclick = () => {
        if(!confirm("Remove all completed items?")) return;
        state.i = state.i.filter(item => !item.done);
        update();
        renderItems();
    };

    // List Clicks (Delete, Toggle, Reorder)
    container.querySelector('#list-items').onclick = (e) => {
        const btn = e.target.closest('button');
        const li = e.target.closest('li');
        
        // Handle Button Clicks
        if (btn && li) {
            const idx = parseInt(li.dataset.idx);

            // Delete
            if (btn.classList.contains('delete-btn')) {
                state.i.splice(idx, 1);
            }
            // Reorder
            else if (btn.classList.contains('move-btn')) {
                const dir = btn.dataset.dir;
                const to = dir === 'up' ? idx - 1 : idx + 1;
                if (to >= 0 && to < state.i.length) {
                    // Swap
                    [state.i[idx], state.i[to]] = [state.i[to], state.i[idx]];
                } else {
                    return; // invalid move
                }
            }
            update();
            renderItems();
            return;
        }

        // Handle Checkbox/Item Clicks (Toggle)
        if (li && !btn) {
            const idx = parseInt(li.dataset.idx);
            const cb = li.querySelector('input[type="checkbox"]');
            
            // If we clicked something other than the checkbox itself (e.g. text), toggle the checkbox
            if (e.target !== cb) {
                cb.checked = !cb.checked;
            }
            
            state.i[idx].done = cb.checked;
            update();
            renderItems();
        }
    };

    renderItems();
}