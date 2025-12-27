// src/utils.js

export function loadState(rawData, defaultState) {
    if (!rawData) {
        return JSON.parse(JSON.stringify(defaultState));
    }
    try {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(rawData))));
        return decoded;
    } catch (e) {
        console.error("Hash decode failed", e);
        return JSON.parse(JSON.stringify(defaultState));
    }
}

export function saveState(toolId, state) {
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(state))));
    const newHash = `#${toolId}:${encoded}`;
    
    // Capture the current hash BEFORE we change it, so we can find the old history entry
    const oldHash = window.location.hash;
    
    history.replaceState(null, null, newHash);
    
    // Update history, replacing the old hash entry with the new one
    updateHistory(toolId, state.t || "Untitled", newHash, oldHash);
}

export function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag])
    );
}

// --- History Logic ---

export function getHistory() {
    return JSON.parse(localStorage.getItem('nestly_history')) || [];
}

/**
 * Smart history updater.
 * - If oldHashToReplace is found, it updates that entry (deduplication on edit).
 * - If hash is found, it updates that entry (move to top on view).
 * - Otherwise, it adds a new entry.
 */
export function updateHistory(toolId, title, hash, oldHashToReplace = null) {
    let history = getHistory();
    let existingIndex = -1;

    // 1. Try to find the item we are replacing (Edit Mode)
    if (oldHashToReplace) {
        existingIndex = history.findIndex(h => h.hash === oldHashToReplace);
    }

    // 2. If not found, check if the NEW hash already exists (View Mode / Duplicate Link)
    if (existingIndex === -1) {
        existingIndex = history.findIndex(h => h.hash === hash);
    }

    let item;
    if (existingIndex !== -1) {
        // Remove existing item so we can move it to the top
        item = history.splice(existingIndex, 1)[0];
        // Update its details
        item.title = title;
        item.hash = hash;
        item.date = Date.now();
    } else {
        // Create new item
        item = { toolId, title, hash, date: Date.now() };
    }

    // Add to top
    history.unshift(item);

    // Keep only last 10
    if (history.length > 10) history.pop();

    localStorage.setItem('nestly_history', JSON.stringify(history));
}

// --- Shared Functionality ---

export function copyLink(btnElement) {
    navigator.clipboard.writeText(window.location.href).then(() => {
        const originalText = btnElement.innerHTML;
        btnElement.innerHTML = "✅ Copied!";
        setTimeout(() => btnElement.innerHTML = originalText, 2000);
    });
}

export async function copyShortLink(btnElement) {
    const originalText = btnElement.innerHTML;
    
    if (!confirm("⚠️ Create Short Link?\n\nThis sends your list data to a third party (TinyURL) to generate the link. Proceed?")) {
        return;
    }

    btnElement.innerHTML = "⏳...";
    btnElement.disabled = true;

    try {
        const longUrl = window.location.href;
        const api = 'https://corsproxy.io/?' + encodeURIComponent('https://tinyurl.com/api-create.php?url=' + encodeURIComponent(longUrl));
        
        const res = await fetch(api);
        if(!res.ok) throw new Error("Service failed");
        
        const shortUrl = await res.text();
        if(!shortUrl.startsWith('http')) throw new Error("Invalid response");

        await navigator.clipboard.writeText(shortUrl);
        btnElement.innerHTML = "✅ Copied!";
    } catch (err) {
        console.error(err);
        alert("Error shortening link. The list might be too long.");
        btnElement.innerHTML = "❌ Error";
    }

    setTimeout(() => {
        btnElement.innerHTML = originalText;
        btnElement.disabled = false;
    }, 2000);
}

export function showQR() {
    let modal = document.getElementById('qr-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'qr-modal';
        modal.className = 'qr-modal';
        modal.innerHTML = `
            <div class="qr-content">
                <button class="qr-close">&times;</button>
                <h3>Scan to Share</h3>
                <img id="qr-img" src="" alt="QR Code" />
                <p>Point your camera here to open this list.</p>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('.qr-close').onclick = () => modal.style.display = 'none';
        modal.onclick = (e) => {
            if (e.target === modal) modal.style.display = 'none';
        };
    }

    const url = encodeURIComponent(window.location.href);
    const qrImg = modal.querySelector('#qr-img');
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${url}`;

    modal.style.display = 'flex';
}

export function initShareButtons(targetElement) {
    if (!targetElement) return;
    
    targetElement.className = 'share-container';
    targetElement.innerHTML = `
        <button class="btn-share" id="btn-copy"><span>🔗</span> Copy</button>
        <button class="btn-share" id="btn-short"><span>✂️</span> Shorten</button>
        <button class="btn-share" id="btn-qr"><span>🏁</span> QR</button>
    `;

    targetElement.querySelector('#btn-copy').onclick = (e) => copyLink(e.currentTarget);
    targetElement.querySelector('#btn-short').onclick = (e) => copyShortLink(e.currentTarget);
    targetElement.querySelector('#btn-qr').onclick = () => showQR();
}