// src/tools/itinerary.js
import { loadState, saveState, escapeHTML, copyLink, showQR } from '../utils.js';

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
            <a href="#" class="back-btn" style="margin:0">← Back</a>
            <button id="view-btn" class="toggle-btn">👁️ Preview</button>
        </div>

        <input type="text" id="t-in" value="${escapeHTML(state.t)}" placeholder="Trip Name (e.g. Japan 2026)" 
               style="font-size:2rem; font-weight:700; border:none; background:none; color:var(--text); width:100%; outline:none; margin-bottom:5px;">
        
        <input type="text" id="d-in" value="${escapeHTML(state.d)}" placeholder="Dates (e.g. Oct 12 - 20)" 
               style="font-size:1.1rem; color:var(--accent); border:none; background:none; width:100%; outline:none; margin-bottom:20px; font-weight:500;">

        <div class="grid" style="margin-bottom:20px;">
            <div>
                <div class="section-label">✈️ Transport</div>
                <textarea id="f-in" placeholder="Flight #, Times, Car Rental..." style="width:100%; height:120px; padding:12px; border-radius:12px; border:1px solid var(--border); background:var(--input-bg); color:var(--text); font-family:inherit; resize:none;">${escapeHTML(state.f)}</textarea>
            </div>
            <div>
                <div class="section-label">🏨 Lodging</div>
                <textarea id="h-in" placeholder="Hotel Name, Address, Codes..." style="width:100%; height:120px; padding:12px; border-radius:12px; border:1px solid var(--border); background:var(--input-bg); color:var(--text); font-family:inherit; resize:none;">${escapeHTML(state.h)}</textarea>
            </div>
        </div>

        <div class="section-label">📅 The Plan</div>
        <textarea id="p-in" placeholder="Day 1: Arrival & Dinner\nDay 2: Museum tour..." style="width:100%; height:250px; padding:15px; border-radius:12px; border:1px solid var(--border); background:var(--input-bg); color:var(--text); font-family:inherit; font-size:1rem; line-height:1.5; resize:vertical;">${escapeHTML(state.p)}</textarea>

        <div class="share-container">
            <button id="share-b" class="btn-share"><span>🔗</span> Copy Link</button>
            <button id="qr-b" class="btn-share"><span>🏁</span> QR Code</button>
        </div>
    `;

    // Bind inputs
    const update = () => saveState('itinerary', state);
    container.querySelector('#t-in').oninput = (e) => { state.t = e.target.value; update(); };
    container.querySelector('#d-in').oninput = (e) => { state.d = e.target.value; update(); };
    container.querySelector('#f-in').oninput = (e) => { state.f = e.target.value; update(); };
    container.querySelector('#h-in').oninput = (e) => { state.h = e.target.value; update(); };
    container.querySelector('#p-in').oninput = (e) => { state.p = e.target.value; update(); };

    container.querySelector('#view-btn').onclick = () => { isEditing = false; update(); render(container); };
    
    container.querySelector('#share-b').onclick = (e) => copyLink(e.currentTarget);
    container.querySelector('#qr-b').onclick = () => showQR();
}

function renderViewer(container) {
    const fmt = (txt) => txt ? txt.replace(/\n/g, '<br>') : '<span style="color:#86868b; font-style:italic">Not set</span>';

    container.innerHTML = `
        <div class="top-bar">
            <a href="#" class="back-btn" style="margin:0">← Back</a>
            <button id="edit-btn" class="toggle-btn">✏️ Edit</button>
        </div>

        <h1 style="margin-bottom:5px; font-size:2.5rem;">${escapeHTML(state.t)}</h1>
        <p style="color:var(--accent); font-weight:600; font-size:1.1rem; margin-bottom:30px;">${escapeHTML(state.d) || 'Dates TBD'}</p>

        <div class="grid" style="margin-bottom:30px;">
            <div style="background:var(--card-bg); padding:20px; border-radius:18px;">
                <div style="font-size:1.5rem; margin-bottom:10px;">✈️</div>
                <div style="font-weight:600; margin-bottom:5px;">Transport</div>
                <div style="font-size:0.95rem; line-height:1.5; opacity:0.9;">${fmt(escapeHTML(state.f))}</div>
            </div>
            <div style="background:var(--card-bg); padding:20px; border-radius:18px;">
                <div style="font-size:1.5rem; margin-bottom:10px;">🏨</div>
                <div style="font-weight:600; margin-bottom:5px;">Lodging</div>
                <div style="font-size:0.95rem; line-height:1.5; opacity:0.9;">${fmt(escapeHTML(state.h))}</div>
            </div>
        </div>

        <div class="section-label">Itinerary</div>
        <div style="font-size:1.1rem; line-height:1.7; white-space: pre-wrap;">${escapeHTML(state.p) || 'No plans yet...'}</div>
    `;

    container.querySelector('#edit-btn').onclick = () => { isEditing = true; render(container); };
}