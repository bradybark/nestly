import { initShareButtons, updateHistory, showToast, refreshIcons } from '../utils.js';

let state = {
    step: 'compose',
    data: null,
    secret: ""
};

export function initLockbox(container, rawData) {
    if (rawData) {
        state.data = rawData;
        state.step = 'locked';
    } else {
        state.step = 'compose';
    }
    render(container);
}

function render(container) {
    if (state.step === 'compose') renderCompose(container);
    if (state.step === 'locked') renderLocked(container);
    if (state.step === 'revealed') renderRevealed(container);
}

function renderCompose(container) {
    container.innerHTML = `
        <a href="#" class="back-btn"><i data-lucide="arrow-left"></i> Back</a>
        <h2 class="font-display" style="text-align:center; margin-bottom:10px;">Lockbox</h2>
        <p style="text-align:center; color:var(--text-muted); margin-bottom:30px;">Encrypt a message with a password.</p>

        <textarea id="msg-in" placeholder="Write your secret here..." style="width:100%; height:150px; padding:15px; border-radius:4px; border:1px solid var(--border); background:var(--input-bg); color:var(--text); font-size:1.1rem; margin-bottom:20px;"></textarea>

        <input type="text" id="pass-in" placeholder="Set a Password" style="width:100%; margin-bottom:20px;">

        <button id="lock-btn" class="btn-add" style="width:100%; font-size:1.1rem;"><i data-lucide="lock"></i> Encrypt & Create Link</button>
    `;

    refreshIcons();

    container.querySelector('#lock-btn').onclick = async () => {
        const msg = container.querySelector('#msg-in').value;
        const pass = container.querySelector('#pass-in').value;

        if (!msg || !pass) return showToast("Please enter both a message and a password.", "error");

        const btn = container.querySelector('#lock-btn');
        btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Encrypting...';
        refreshIcons();

        try {
            const encryptedData = await encryptMessage(msg, pass);
            const encoded = btoa(encryptedData);
            const newHash = '#lockbox:' + encoded;

            // Explicitly add to history on creation
            history.replaceState(null, null, newHash);
            updateHistory('lockbox', "Secret Message", newHash);

            showToast("Message encrypted successfully!");
            renderLinkReady(container);
        } catch (e) {
            console.error(e);
            showToast("Encryption failed.", "error");
            btn.innerHTML = '<i data-lucide="lock"></i> Encrypt & Create Link';
            refreshIcons();
        }
    };
}

function renderLinkReady(container) {
    container.innerHTML = `
        <div style="text-align:center; padding:40px 20px;">
            <div class="tool-icon" style="margin-bottom:20px;"><i data-lucide="lock-keyhole"></i></div>
            <h2 class="font-display">Message Locked!</h2>
            <p style="color:var(--text-muted); margin-bottom:30px;">This link now contains your encrypted secret.</p>
            <div id="share-root"></div>
            <button onclick="location.reload()" class="nav-link-underline" style="margin-top:20px; background:none; border:none; color:var(--text-muted); cursor:pointer; font-family:var(--font-mono);">Create New</button>
        </div>
    `;

    initShareButtons(container.querySelector('#share-root'));
    refreshIcons();
}

function renderLocked(container) {
    container.innerHTML = `
        <a href="#" class="back-btn"><i data-lucide="arrow-left"></i> Home</a>
        <div style="text-align:center; padding-top:20px;">
            <div class="tool-icon" style="margin-bottom:20px;"><i data-lucide="lock"></i></div>
            <h2 class="font-display">Restricted Access</h2>
            <p style="color:var(--text-muted); margin-bottom:30px;">Enter the password to read this note.</p>

            <input type="password" id="unlock-pass" placeholder="Password" style="width:100%; margin-bottom:20px; text-align:center;">

            <button id="unlock-btn" class="btn-add" style="width:100%;"><i data-lucide="unlock"></i> Unlock</button>
            <p id="error-msg" style="color:var(--danger); margin-top:15px; display:none; font-family:var(--font-mono);">Incorrect Password</p>
        </div>
    `;

    refreshIcons();

    container.querySelector('#unlock-btn').onclick = async () => {
        const pass = container.querySelector('#unlock-pass').value;
        const err = container.querySelector('#error-msg');

        try {
            const rawEncrypted = atob(state.data);
            const decrypted = await decryptMessage(rawEncrypted, pass);
            state.secret = decrypted;
            state.step = 'revealed';
            render(container);
        } catch (e) {
            console.error(e);
            err.style.display = 'block';
        }
    };
}

function renderRevealed(container) {
    container.innerHTML = `
        <div style="text-align:center;">
            <div class="tool-icon" style="margin-bottom:20px;"><i data-lucide="unlock"></i></div>
            <h2 class="font-display" style="color:var(--text);">Secret Revealed</h2>
        </div>

        <div class="corner-brackets" style="background:var(--card-bg); padding:20px; border-radius:4px; border:1px solid var(--border); margin:20px 0; font-size:1.2rem; line-height:1.6; white-space:pre-wrap;">${state.secret}</div>

        <button onclick="location.hash=''; location.reload();" class="btn-danger" style="width:100%; padding:15px; border:1px solid var(--danger); color:var(--danger); background:none; border-radius:4px; font-family:var(--font-mono); font-weight:500; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:8px;"><i data-lucide="trash-2"></i> Destroy & Leave</button>
    `;

    refreshIcons();
}

async function encryptMessage(message, password) {
    const enc = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
        keyMaterial, { name: "AES-GCM", length: 256 }, false, ["encrypt"]
    );

    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(message));

    return JSON.stringify({
        s: Array.from(salt),
        iv: Array.from(iv),
        c: Array.from(new Uint8Array(encrypted))
    });
}

async function decryptMessage(packedData, password) {
    const data = JSON.parse(packedData);
    const salt = new Uint8Array(data.s);
    const iv = new Uint8Array(data.iv);
    const ciphertext = new Uint8Array(data.c);

    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
        keyMaterial, { name: "AES-GCM", length: 256 }, false, ["decrypt"]
    );

    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
    return new TextDecoder().decode(decrypted);
}