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
    const hash = `${toolId}:${encoded}`;
    history.replaceState(null, null, `#${hash}`);
    addToHistory(toolId, state.t || "Untitled", window.location.hash);
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

export function copyLink(btnElement) {
    navigator.clipboard.writeText(window.location.href).then(() => {
        const originalText = btnElement.innerHTML;
        btnElement.innerHTML = "✅ Link Copied!";
        setTimeout(() => btnElement.innerHTML = originalText, 2000);
    });
}

/**
 * NEW: QR Code Modal
 */
export function showQR() {
    // 1. Create Modal if it doesn't exist
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
        
        // Close logic
        modal.querySelector('.qr-close').onclick = () => modal.style.display = 'none';
        modal.onclick = (e) => {
            if (e.target === modal) modal.style.display = 'none';
        };
    }

    // 2. Set QR Image Source using current URL
    const url = encodeURIComponent(window.location.href);
    const qrImg = modal.querySelector('#qr-img');
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${url}`;

    // 3. Show
    modal.style.display = 'flex';
}

function addToHistory(toolId, title, hash) {
    let history = JSON.parse(localStorage.getItem('nestly_history')) || [];
    history = history.filter(h => h.hash !== hash);
    history.unshift({ toolId, title, hash, date: Date.now() });
    if (history.length > 10) history.pop();
    localStorage.setItem('nestly_history', JSON.stringify(history));
}

export function getHistory() {
    return JSON.parse(localStorage.getItem('nestly_history')) || [];
}