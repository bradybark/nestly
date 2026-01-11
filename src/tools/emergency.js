import { loadState, saveState, escapeHTML, initShareButtons, refreshIcons } from '../utils.js';

let state;
let isEditing = true;

export function initEmergency(container, rawData) {
    state = loadState(rawData, { t: "House Info", c: [], n: "" });

    if (state.c.length === 0) state.c.push({ n: "", p: "" });
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
            <a href="#" class="back-btn" style="margin:0"><i data-lucide="arrow-left"></i> Back</a>
            <button id="view-btn" class="toggle-btn"><i data-lucide="eye"></i> Preview</button>
        </div>

        <input type="text" id="t-in" value="${escapeHTML(state.t)}" placeholder="Title (e.g. Babysitter Info)"
               class="font-display" style="font-size:2rem; font-weight:700; border:none; background:none; color:var(--text); width:100%; outline:none; margin-bottom:20px;">

        <div class="section-label"><i data-lucide="phone" style="width:16px; height:16px;"></i> Emergency Contacts</div>
        <div id="contacts-list"></div>
        <button id="add-c" class="nav-link-underline" style="margin-top:10px; background:none; border:none; color:var(--text-muted); font-family:var(--font-mono); font-weight:500; cursor:pointer;">+ Add Contact</button>

        <div class="section-label" style="margin-top:20px;"><i data-lucide="file-text" style="width:16px; height:16px;"></i> Important Notes</div>
        <textarea id="n-in" placeholder="Alarm code is 1234. Water shutoff is in the basement..." style="width:100%; height:150px; padding:15px; border-radius:4px; border:1px solid var(--border); background:var(--input-bg); color:var(--text); resize:vertical;">${escapeHTML(state.n)}</textarea>

        <div id="share-root"></div>
    `;

    initShareButtons(container.querySelector('#share-root'));
    refreshIcons();

    container.querySelector('#t-in').oninput = (e) => { state.t = e.target.value; saveState('emergency', state); };
    container.querySelector('#n-in').oninput = (e) => { state.n = e.target.value; saveState('emergency', state); };

    const cList = container.querySelector('#contacts-list');
    const renderContactsInputs = () => {
        cList.innerHTML = state.c.map((c, i) => `
            <div style="display:flex; gap:10px; margin-bottom:10px;">
                <input type="text" class="c-name" data-idx="${i}" value="${escapeHTML(c.n)}" placeholder="Name" style="flex:1;">
                <input type="tel" class="c-phone" data-idx="${i}" value="${escapeHTML(c.p)}" placeholder="Phone #" style="flex:1;">
                <button class="del-c" data-idx="${i}" style="border:none; background:none; color:var(--danger); font-size:1.2rem; cursor:pointer;"><i data-lucide="x" style="width:16px; height:16px;"></i></button>
            </div>
        `).join('');
        refreshIcons();

        cList.querySelectorAll('.c-name').forEach(el => el.oninput = (e) => { state.c[el.dataset.idx].n = e.target.value; saveState('emergency', state); });
        cList.querySelectorAll('.c-phone').forEach(el => el.oninput = (e) => { state.c[el.dataset.idx].p = e.target.value; saveState('emergency', state); });
        cList.querySelectorAll('.del-c').forEach(el => el.onclick = () => { state.c.splice(el.dataset.idx, 1); saveState('emergency', state); renderContactsInputs(); });
    };
    renderContactsInputs();

    container.querySelector('#add-c').onclick = () => { state.c.push({ n: "", p: "" }); saveState('emergency', state); renderContactsInputs(); };
    container.querySelector('#view-btn').onclick = () => { isEditing = false; saveState('emergency', state); render(container); };
}

function renderViewer(container) {
    container.innerHTML = `
        <div class="top-bar">
            <a href="#" class="back-btn" style="margin:0"><i data-lucide="arrow-left"></i> Back</a>
            <button id="edit-btn" class="toggle-btn"><i data-lucide="edit-2"></i> Edit</button>
        </div>

        <h1 class="font-display" style="margin-bottom:30px; font-size:2.5rem; text-align:center;">${escapeHTML(state.t)}</h1>

        <div class="section-label">Contacts</div>
        <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap:15px; margin-bottom:30px;">
            ${state.c.map(c => `
                <a href="tel:${escapeHTML(c.p)}" class="corner-brackets" style="text-decoration:none; color:inherit; background:var(--card-bg); padding:15px; border-radius:4px; text-align:center; display:block; border:1px solid var(--border); transition:all 0.2s;">
                    <div style="font-size:1.5rem; margin-bottom:5px; position:relative; z-index:2; display:flex; justify-content:center;"><i data-lucide="phone"></i></div>
                    <div class="font-mono" style="font-weight:600; position:relative; z-index:2;">${escapeHTML(c.n) || 'Unknown'}</div>
                    <div style="font-size:0.9rem; color:var(--text-muted); position:relative; z-index:2;">${escapeHTML(c.p)}</div>
                </a>
            `).join('')}
        </div>

        <div class="section-label">Notes</div>
        <div class="corner-brackets" style="font-size:1.1rem; line-height:1.6; white-space: pre-wrap; background:var(--card-bg); padding:20px; border-radius:4px; border:1px solid var(--border);">${escapeHTML(state.n) || 'No notes listed.'}</div>
    `;
    refreshIcons();
    container.querySelector('#edit-btn').onclick = () => { isEditing = true; render(container); };
}