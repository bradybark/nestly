// src/utils.js
import LZString from 'lz-string';

// --- State Management (Compression) ---

export function loadState(rawData, defaultState) {
    if (!rawData) {
        return JSON.parse(JSON.stringify(defaultState));
    }
    try {
        // 1. Try LZ-String decompression first (New Format)
        let decodedStr = LZString.decompressFromEncodedURIComponent(rawData);
        
        // 2. If null, it might be the old Base64 format (Backward Compatibility)
        if (!decodedStr) {
            decodedStr = decodeURIComponent(escape(atob(rawData)));
        }

        return JSON.parse(decodedStr);
    } catch (e) {
        console.error("Hash decode failed", e);
        return JSON.parse(JSON.stringify(defaultState));
    }
}

export function saveState(toolId, state) {
    // Use LZ-String for significantly shorter URLs
    const encoded = LZString.compressToEncodedURIComponent(JSON.stringify(state));
    const newHash = `#${toolId}:${encoded}`;
    
    const oldHash = window.location.hash;
    
    history.replaceState(null, null, newHash);
    
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

// --- History Logic & Date Handling ---

export function getHistory() {
    return JSON.parse(localStorage.getItem('nestly_history')) || [];
}

export function updateHistory(toolId, title, hash, oldHashToReplace = null) {
    let history = getHistory();
    let existingIndex = -1;

    if (oldHashToReplace) {
        existingIndex = history.findIndex(h => h.hash === oldHashToReplace);
    }

    if (existingIndex === -1) {
        existingIndex = history.findIndex(h => h.hash === hash);
    }

    let item;
    if (existingIndex !== -1) {
        item = history.splice(existingIndex, 1)[0];
        item.title = title;
        item.hash = hash;
        item.date = Date.now();
    } else {
        item = { toolId, title, hash, date: Date.now() };
    }

    history.unshift(item);
    if (history.length > 10) history.pop();
    localStorage.setItem('nestly_history', JSON.stringify(history));
}

export function timeAgo(timestamp) {
    if (!timestamp) return '';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    
    return "Just now";
}

// --- Shared Functionality & UI ---

export function showToast(message, type = 'normal') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toast-out 0.3s forwards';
        toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
}

export function showConfirm(title, message) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-box">
                <div class="modal-title">${escapeHTML(title)}</div>
                <div class="modal-desc">${escapeHTML(message)}</div>
                <div class="modal-actions">
                    <button class="modal-btn modal-cancel">Cancel</button>
                    <button class="modal-btn modal-confirm">Confirm</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const close = (result) => {
            overlay.remove();
            resolve(result);
        };

        overlay.querySelector('.modal-cancel').onclick = () => close(false);
        overlay.querySelector('.modal-confirm').onclick = () => close(true);
        overlay.onclick = (e) => { if (e.target === overlay) close(false); };
    });
}

export function copyLink(btnElement) {
    navigator.clipboard.writeText(window.location.href).then(() => {
        const originalText = btnElement.innerHTML;
        btnElement.innerHTML = "✅ Copied!";
        showToast("Link copied to clipboard!");
        setTimeout(() => btnElement.innerHTML = originalText, 2000);
    });
}

export async function copyShortLink(btnElement) {
    const originalText = btnElement.innerHTML;
    
    const confirmed = await showConfirm(
        "Create Short Link?", 
        "This will generate a TinyURL for your list."
    );

    if (!confirmed) return;

    btnElement.innerHTML = "⏳...";
    btnElement.disabled = true;

    try {
        const longUrl = window.location.href;
        
        // Call our internal API instead of a public CORS proxy
        // This requires the api/shorten.js file to be deployed (e.g. to Vercel)
        const res = await fetch(`/api/shorten?url=${encodeURIComponent(longUrl)}`);
        
        if(!res.ok) throw new Error("Service failed");
        
        const data = await res.json();
        if(!data.shortUrl) throw new Error("Invalid response");

        await navigator.clipboard.writeText(data.shortUrl);
        showToast("Short link copied!");
        btnElement.innerHTML = "✅ Copied!";
    } catch (err) {
        console.error(err);
        showToast("Error. Backend not deployed?", "error");
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