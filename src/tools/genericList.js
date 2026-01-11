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
            <li class="list-item" draggable="true" data-idx="${idx}">
                <div class="item-left" style="opacity:${item.done ? 0.4 : 1}; text-decoration:${item.done ? 'line-through' : 'none'}; cursor: pointer;">
                    ${config.renderItem(item)}
                </div>
                <div class="actions">
                    <span class="drag-handle" style="cursor:grab; padding: 0 5px; color:var(--text-muted); display:flex; align-items:center;">
                        <i data-lucide="grip-vertical" style="width:16px; height:16px;"></i>
                    </span>
                    <button class="delete-btn" data-idx="${idx}"><i data-lucide="x" style="width:14px; height:14px;"></i></button>
                </div>
            </li>
        `).join('');

        refreshIcons();

        // Attach Drag Events
        const items = list.querySelectorAll('li');
        items.forEach(item => {
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragenter', handleDragEnter);
            item.addEventListener('dragover', handleDragOver);
            item.addEventListener('dragleave', handleDragLeave);
            item.addEventListener('drop', handleDrop);
            item.addEventListener('dragend', handleDragEnd);
        });
    };

    // --- Drag and Drop Handlers ---
    let dragSrcEl = null;

    function handleDragStart(e) {
        this.style.opacity = '0.4';
        dragSrcEl = this;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
    }

    function handleDragOver(e) {
        if (e.preventDefault) e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    function handleDragEnter(e) {
        this.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        this.classList.remove('drag-over');
    }

    function handleDrop(e) {
        if (e.stopPropagation) e.stopPropagation();

        if (dragSrcEl !== this) {
            const srcIdx = parseInt(dragSrcEl.dataset.idx);
            const targetIdx = parseInt(this.dataset.idx);

            // Move item in array
            const item = state.i.splice(srcIdx, 1)[0];
            state.i.splice(targetIdx, 0, item);

            update();
            renderItems();
        }
        return false;
    }

    function handleDragEnd(e) {
        this.style.opacity = '1';
        items.forEach(item => item.classList.remove('drag-over'));
    }

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
        if (!confirm("Remove all completed items?")) return;
        state.i = state.i.filter(item => !item.done);
        update();
        renderItems();
    };

    // List Clicks (Delete & Toggle)
    container.querySelector('#list-items').onclick = (e) => {
        const btn = e.target.closest('button');
        const li = e.target.closest('li');

        // Handle Delete Button
        if (btn && li && btn.classList.contains('delete-btn')) {
            const idx = parseInt(li.dataset.idx);
            state.i.splice(idx, 1);
            update();
            renderItems();
            return;
        }

        // Handle Item Click (Toggle) - Ignore if clicking button or drag handle
        if (li && !btn && !e.target.closest('.drag-handle')) {
            const idx = parseInt(li.dataset.idx);
            state.i[idx].done = !state.i[idx].done;
            update();
            renderItems();
        }
    };

    renderItems();
}