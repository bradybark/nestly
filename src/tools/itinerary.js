// src/tools/itinerary.js

let state = {
    t: "Trip Name", // Title
    d: "",          // Dates
    f: "",          // Flights / Transport
    h: "",          // Hotel / Lodging
    p: ""           // Plan / Schedule
};

let isEditing = true;

export function initItinerary(container, rawData) {
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
    history.replaceState(null, null, '#itinerary:' + encoded);
}

function render(container) {
    if (isEditing) renderEditor(container);
    else renderViewer(container);
}

// --- EDITOR ---
function renderEditor(container) {
    container.innerHTML = `
        <div class="top-bar">
            <a href="#" class="back-btn" style="margin:0">← Back</a>
            <button id="view-btn" class="toggle-btn">👁️ Preview</button>
        </div>

        <input type="text" id="t-in" value="${state.t}" placeholder="Trip Name (e.g. Japan 2026)" 
               style="font-size:2rem; font-weight:700; border:none; background:none; color:var(--text); width:100%; outline:none; margin-bottom:5px;">
        
        <input type="text" id="d-in" value="${state.d}" placeholder="Dates (e.g. Oct 12 - 20)" 
               style="font-size:1.1rem; color:var(--accent); border:none; background:none; width:100%; outline:none; margin-bottom:20px; font-weight:500;">

        <div class="grid" style="margin-bottom:20px;">
            <div>
                <div class="section-label">✈️ Transport</div>
                <textarea id="f-in" placeholder="Flight #, Times, Car Rental..." style="width:100%; height:120px; padding:12px; border-radius:12px; border:1px solid var(--border); background:var(--card-bg); color:var(--text); font-family:inherit; resize:none;">${state.f}</textarea>
            </div>
            <div>
                <div class="section-label">🏨 Lodging</div>
                <textarea id="h-in" placeholder="Hotel Name, Address, Codes..." style="width:100%; height:120px; padding:12px; border-radius:12px; border:1px solid var(--border); background:var(--card-bg); color:var(--text); font-family:inherit; resize:none;">${state.h}</textarea>
            </div>
        </div>

        <div class="section-label">📅 The Plan</div>
        <textarea id="p-in" placeholder="Day 1: Arrival & Dinner\nDay 2: Museum tour..." style="width:100%; height:250px; padding:15px; border-radius:12px; border:1px solid var(--border); background:var(--card-bg); color:var(--text); font-family:inherit; font-size:1rem; line-height:1.5; resize:vertical;">${state.p}</textarea>

        <div class="share-container">
            <button id="share-b" class="btn-share"><span>🔗</span> Copy Itinerary Link</button>
            <p style="font-size: 0.85rem; color: #86868b; margin-top: 12px; text-align: center;">Save updates by sharing the link!</p>
        </div>
    `;

    // Bind inputs
    const attach = (id, key) => {
        container.querySelector(id).oninput = (e) => {
            state[key] = e.target.value;
            save();
        };
    };
    attach('#t-in', 't');
    attach('#d-in', 'd');
    attach('#f-in', 'f');
    attach('#h-in', 'h');
    attach('#p-in', 'p');

    container.querySelector('#view-btn').onclick = () => { isEditing = false; save(); render(container); };
    container.querySelector('#share-b').onclick = () => {
        navigator.clipboard.writeText(window.location.href);
        const btn = container.querySelector('#share-b');
        btn.innerHTML = "✅ Copied!";
        setTimeout(() => btn.innerHTML = "<span>🔗</span> Copy Itinerary Link", 2000);
    };
}

// --- VIEWER ---
function renderViewer(container) {
    // Helper to format text with newlines
    const fmt = (txt) => txt ? txt.replace(/\n/g, '<br>') : '<span style="color:#86868b; font-style:italic">Not set</span>';

    container.innerHTML = `
        <div class="top-bar">
            <a href="#" class="back-btn" style="margin:0">← Back</a>
            <button id="edit-btn" class="toggle-btn">✏️ Edit</button>
        </div>

        <h1 style="margin-bottom:5px; font-size:2.5rem;">${state.t}</h1>
        <p style="color:var(--accent); font-weight:600; font-size:1.1rem; margin-bottom:30px;">${state.d || 'Dates TBD'}</p>

        <div class="grid" style="margin-bottom:30px;">
            <div style="background:var(--card-bg); padding:20px; border-radius:18px;">
                <div style="font-size:1.5rem; margin-bottom:10px;">✈️</div>
                <div style="font-weight:600; margin-bottom:5px;">Transport</div>
                <div style="font-size:0.95rem; line-height:1.5; opacity:0.9;">${fmt(state.f)}</div>
            </div>
            <div style="background:var(--card-bg); padding:20px; border-radius:18px;">
                <div style="font-size:1.5rem; margin-bottom:10px;">🏨</div>
                <div style="font-weight:600; margin-bottom:5px;">Lodging</div>
                <div style="font-size:0.95rem; line-height:1.5; opacity:0.9;">${fmt(state.h)}</div>
            </div>
        </div>

        <div class="section-label">Itinerary</div>
        <div style="font-size:1.1rem; line-height:1.7; white-space: pre-wrap;">${state.p || 'No plans yet...'}</div>
    `;

    container.querySelector('#edit-btn').onclick = () => { isEditing = true; render(container); };
}