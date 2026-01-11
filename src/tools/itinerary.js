import { loadState, saveState, escapeHTML, initShareButtons, refreshIcons } from '../utils.js';

let state;
let isEditing = true;

export function initItinerary(container, rawData) {
    state = loadState(rawData, { t: "Trip Name", d: "", f: "", h: "", p: "" });
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

        <input type="text" id="t-in" value="${escapeHTML(state.t)}" placeholder="Trip Name (e.g. Japan 2026)"
               class="font-display" style="font-size:2rem; font-weight:700; border:none; background:none; color:var(--text); width:100%; outline:none; margin-bottom:5px;">

        <input type="text" id="d-in" value="${escapeHTML(state.d)}" placeholder="Dates (e.g. Oct 12 - 20)"
               class="font-mono" style="font-size:1rem; color:var(--text-muted); border:none; background:none; width:100%; outline:none; margin-bottom:20px; font-weight:500;">

        <div class="grid" style="margin-bottom:20px;">
            <div>
                <div class="section-label"><i data-lucide="plane" style="width:14px; height:14px; display:inline; vertical-align:middle; margin-right:4px;"></i> Transport</div>
                <textarea id="f-in" placeholder="Flight #, Times, Car Rental..." style="width:100%; height:120px; padding:12px; border-radius:4px; border:1px solid var(--border); background:var(--input-bg); color:var(--text); font-family:inherit; resize:none;">${escapeHTML(state.f)}</textarea>
            </div>
            <div>
                <div class="section-label"><i data-lucide="building" style="width:14px; height:14px; display:inline; vertical-align:middle; margin-right:4px;"></i> Lodging</div>
                <textarea id="h-in" placeholder="Hotel Name, Address, Codes..." style="width:100%; height:120px; padding:12px; border-radius:4px; border:1px solid var(--border); background:var(--input-bg); color:var(--text); font-family:inherit; resize:none;">${escapeHTML(state.h)}</textarea>
            </div>
        </div>

        <div class="section-label"><i data-lucide="calendar" style="width:14px; height:14px; display:inline; vertical-align:middle; margin-right:4px;"></i> The Plan</div>
        <textarea id="p-in" placeholder="Day 1: Arrival & Dinner\nDay 2: Museum tour..." style="width:100%; height:250px; padding:15px; border-radius:4px; border:1px solid var(--border); background:var(--input-bg); color:var(--text); font-family:inherit; font-size:1rem; line-height:1.5; resize:vertical;">${escapeHTML(state.p)}</textarea>

        <div id="share-root"></div>
    `;

    initShareButtons(container.querySelector('#share-root'));
    refreshIcons();

    const update = () => saveState('itinerary', state);
    container.querySelector('#t-in').oninput = (e) => { state.t = e.target.value; update(); };
    container.querySelector('#d-in').oninput = (e) => { state.d = e.target.value; update(); };
    container.querySelector('#f-in').oninput = (e) => { state.f = e.target.value; update(); };
    container.querySelector('#h-in').oninput = (e) => { state.h = e.target.value; update(); };
    container.querySelector('#p-in').oninput = (e) => { state.p = e.target.value; update(); };

    container.querySelector('#view-btn').onclick = () => { isEditing = false; update(); render(container); };
}

function renderViewer(container) {
    const fmt = (txt) => txt ? txt.replace(/\n/g, '<br>') : '<span style="color:var(--text-muted); font-style:italic">Not set</span>';

    container.innerHTML = `
        <div class="top-bar">
            <a href="#" class="back-btn" style="margin:0"><i data-lucide="arrow-left"></i> Back</a>
            <button id="edit-btn" class="toggle-btn"><i data-lucide="edit-2"></i> Edit</button>
        </div>

        <h1 class="font-display" style="margin-bottom:5px; font-size:2.5rem;">${escapeHTML(state.t)}</h1>
        <p class="font-mono" style="color:var(--text-muted); font-weight:500; font-size:1rem; margin-bottom:30px;">${escapeHTML(state.d) || 'Dates TBD'}</p>

        <div class="grid" style="margin-bottom:30px;">
            <div class="corner-brackets" style="background:var(--card-bg); padding:20px; border-radius:4px; border:1px solid var(--border);">
                <div class="section-icon" style="margin-bottom:10px; position:relative; z-index:2;"><i data-lucide="plane"></i></div>
                <div class="font-mono" style="font-weight:600; margin-bottom:5px; position:relative; z-index:2;">Transport</div>
                <div style="font-size:0.95rem; line-height:1.5; color:var(--text-muted); position:relative; z-index:2;">${fmt(escapeHTML(state.f))}</div>
            </div>
            <div class="corner-brackets" style="background:var(--card-bg); padding:20px; border-radius:4px; border:1px solid var(--border);">
                <div class="section-icon" style="margin-bottom:10px; position:relative; z-index:2;"><i data-lucide="building"></i></div>
                <div class="font-mono" style="font-weight:600; margin-bottom:5px; position:relative; z-index:2;">Lodging</div>
                <div style="font-size:0.95rem; line-height:1.5; color:var(--text-muted); position:relative; z-index:2;">${fmt(escapeHTML(state.h))}</div>
            </div>
        </div>

        <div class="section-label">Itinerary</div>
        <div style="font-size:1.1rem; line-height:1.7; white-space: pre-wrap;">${escapeHTML(state.p) || 'No plans yet...'}</div>
    `;

    refreshIcons();
    container.querySelector('#edit-btn').onclick = () => { isEditing = true; render(container); };
}