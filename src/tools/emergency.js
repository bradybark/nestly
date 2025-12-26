// src/tools/emergency.js

let state = {
    t: "House Info",      // Title
    w: { s: "", p: "" },  // Wifi: SSID, Password
    c: [],                // Contacts: Array of { n: Name, p: Phone }
    n: ""                 // Notes (Water shutoff, alarm codes, etc.)
};

let isEditing = true;

export function initEmergency(container, rawData) {
    if (rawData) {
        try {
            state = JSON.parse(decodeURIComponent(escape(atob(rawData))));
            isEditing = false;
        } catch (e) { console.error("Hash decode failed"); }
    } else {
        // Default state if new
        if (state.c.length === 0) state.c.push({n: "", p: ""});
        isEditing = true;
    }

    render(container);
}

function save() {
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(state))));
    history.replaceState(null, null, '#emergency:' + encoded);
}

function render(container) {
    if (isEditing) renderEditor(container);
    else renderViewer(container);
}

// --- EDITOR MODE ---
function renderEditor(container) {
    container.innerHTML = `
        <div class="top-bar">
            <a href="#" class="back-btn" style="margin:0">← Back</a>
            <button id="view-btn" class="toggle-btn">👁️ Preview</button>
        </div>

        <input type="text" id="t-in" value="${state.t}" placeholder="Title (e.g. Babysitter Info)" 
               style="font-size:2rem; font-weight:700; border:none; background:none; color:var(--text); width:100%; outline:none; margin-bottom:20px;">
        
        <div class="section-label">📶 Wi-Fi</div>
        <div class="grid" style="margin-bottom:20px; grid-template-columns: 1fr 1fr;">
            <input type="text" id="w-s" value="${state.w.s}" placeholder="Network Name" style="padding:12px; border-radius:12px; border:1px solid var(--border); background:var(--card-bg); color:var(--text);">
            <input type="text" id="w-p" value="${state.w.p}" placeholder="Password" style="padding:12px; border-radius:12px; border:1px solid var(--border); background:var(--card-bg); color:var(--text);">
        </div>

        <div class="section-label">📞 Emergency Contacts</div>
        <div id="contacts-list"></div>
        <button id="add-c" style="margin-top:10px; background:none; border:none; color:var(--accent); font-weight:600; cursor:pointer;">+ Add Contact</button>

        <div class="section-label" style="margin-top:20px;">📝 Important Notes</div>
        <textarea id="n-in" placeholder="Alarm code is 1234. Water shutoff is in the basement..." style="width:100%; height:150px; padding:15px; border-radius:12px; border:1px solid var(--border); background:var(--card-bg); color:var(--text); font-family:inherit; resize:vertical;">${state.n}</textarea>

        <div class="share-container">
            <button id="share-b" class="btn-share"><span>🔗</span> Copy Info Link</button>
            <p style="font-size: 0.85rem; color: #86868b; margin-top: 12px; text-align: center;">Send this to your house sitter.</p>
        </div>
    `;

    // Bind Basic Inputs
    container.querySelector('#t-in').oninput = (e) => { state.t = e.target.value; save(); };
    container.querySelector('#w-s').oninput = (e) => { state.w.s = e.target.value; save(); };
    container.querySelector('#w-p').oninput = (e) => { state.w.p = e.target.value; save(); };
    container.querySelector('#n-in').oninput = (e) => { state.n = e.target.value; save(); };

    // Render Contacts Inputs
    const cList = container.querySelector('#contacts-list');
    const renderContactsInputs = () => {
        cList.innerHTML = state.c.map((c, i) => `
            <div style="display:flex; gap:10px; margin-bottom:10px;">
                <input type="text" class="c-name" data-idx="${i}" value="${c.n}" placeholder="Name (e.g. Mom)" style="flex:1; padding:10px; border-radius:8px; border:1px solid var(--border); background:var(--card-bg); color:var(--text);">
                <input type="tel" class="c-phone" data-idx="${i}" value="${c.p}" placeholder="Phone #" style="flex:1; padding:10px; border-radius:8px; border:1px solid var(--border); background:var(--card-bg); color:var(--text);">
                <button class="del-c" data-idx="${i}" style="border:none; background:none; color:var(--danger); font-size:1.2rem; cursor:pointer;">&times;</button>
            </div>
        `).join('');

        // Bind Contact Events
        cList.querySelectorAll('.c-name').forEach(el => el.oninput = (e) => { state.c[el.dataset.idx].n = e.target.value; save(); });
        cList.querySelectorAll('.c-phone').forEach(el => el.oninput = (e) => { state.c[el.dataset.idx].p = e.target.value; save(); });
        cList.querySelectorAll('.del-c').forEach(el => el.onclick = () => { 
            state.c.splice(el.dataset.idx, 1); 
            save(); 
            renderContactsInputs(); 
        });
    };
    renderContactsInputs();

    container.querySelector('#add-c').onclick = () => {
        state.c.push({n: "", p: ""});
        save();
        renderContactsInputs();
    };

    container.querySelector('#view-btn').onclick = () => { isEditing = false; save(); render(container); };
    container.querySelector('#share-b').onclick = () => {
        navigator.clipboard.writeText(window.location.href);
        const btn = container.querySelector('#share-b');
        btn.innerHTML = "✅ Copied!";
        setTimeout(() => btn.innerHTML = "<span>🔗</span> Copy Info Link", 2000);
    };
}

// --- VIEWER MODE ---
function renderViewer(container) {
    container.innerHTML = `
        <div class="top-bar">
            <a href="#" class="back-btn" style="margin:0">← Back</a>
            <button id="edit-btn" class="toggle-btn">✏️ Edit</button>
        </div>

        <h1 style="margin-bottom:30px; font-size:2.5rem;">${state.t}</h1>

        <div style="background:var(--card-bg); padding:20px; border-radius:18px; margin-bottom:25px; text-align:center;">
            <div style="font-size:0.9rem; color:#86868b; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px;">Wi-Fi Network</div>
            <div style="font-size:1.4rem; font-weight:700; margin-bottom:5px;">${state.w.s || 'Not set'}</div>
            <div style="font-family:monospace; font-size:1.8rem; color:var(--accent); background:var(--bg); padding:10px; border-radius:8px; display:inline-block; margin-top:5px;">${state.w.p || '---'}</div>
        </div>

        <div class="section-label">Contacts</div>
        <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap:15px; margin-bottom:30px;">
            ${state.c.map(c => `
                <a href="tel:${c.p}" style="text-decoration:none; color:inherit; background:var(--card-bg); padding:15px; border-radius:14px; text-align:center; display:block; border:1px solid transparent; transition:0.2s;" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='transparent'">
                    <div style="font-size:1.5rem; margin-bottom:5px;">📞</div>
                    <div style="font-weight:600;">${c.n || 'Unknown'}</div>
                    <div style="font-size:0.9rem; opacity:0.7;">${c.p}</div>
                </a>
            `).join('')}
        </div>

        <div class="section-label">Notes</div>
        <div style="font-size:1.1rem; line-height:1.6; white-space: pre-wrap; background:var(--card-bg); padding:20px; border-radius:18px;">${state.n || 'No notes listed.'}</div>
    `;

    container.querySelector('#edit-btn').onclick = () => { isEditing = true; render(container); };
}