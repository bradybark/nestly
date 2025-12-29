// src/main.js
import './style.css';
import { getHistory, escapeHTML, timeAgo } from './utils.js';
import { initGrocery } from './tools/grocery.js';
import { initChores } from './tools/chores.js';
import { initRecipes } from './tools/recipes.js';
import { initLockbox } from './tools/lockbox.js';
import { initItinerary } from './tools/itinerary.js';
import { initEmergency } from './tools/emergency.js';
import { initPacking } from './tools/packing.js';
import { initWishlist } from './tools/wishlist.js';

const app = document.getElementById('app');

const tools = [
    { id: 'grocery', name: 'Grocery List', icon: '🛒' },
    { id: 'chores', name: 'Chore List', icon: '🧹' },
    { id: 'recipes', name: 'Recipe', icon: '📖' },
    { id: 'packing', name: 'Packing List', icon: '📦' },
    { id: 'itinerary', name: 'Travel Plan', icon: '✈️' },
    { id: 'wishlist', name: 'Wishlist', icon: '🎁' },
    { id: 'emergency', name: 'Emergency Info', icon: '🏥' },
    { id: 'lockbox', name: 'Lockbox', icon: '🔒' },
];

function renderDashboard() {
    const history = getHistory();
    const toolMap = tools.reduce((acc, t) => ({...acc, [t.id]: t}), {});

    app.innerHTML = `
        <header>
            <h1>Nestly</h1>
            <p>Simple tools for your family.</p>
        </header>
        
        <div class="grid">
            ${tools.map(t => `
                <div class="card" data-id="${t.id}">
                    <span class="icon">${t.icon}</span>
                    <span class="label">${t.name}</span>
                </div>
            `).join('')}
        </div>

        ${history.length > 0 ? `
            <details style="margin-top: 40px; border-top: 1px solid var(--border); padding-top: 20px;">
                <summary style="cursor:pointer; font-size:1.1rem; font-weight:600; color:var(--text); outline:none; list-style:none; display:flex; align-items:center; gap:8px;">
                    <span>📂 Saved Lists</span>
                    <span style="font-size:0.8rem; opacity:0.5; font-weight:400;">(Click to show)</span>
                </summary>
                
                <div style="margin-top: 15px;">
                    ${history.map(h => `
                        <a href="${h.hash}" class="history-item">
                            <span class="history-icon">${toolMap[h.toolId]?.icon || '📄'}</span>
                            <div style="flex:1;">
                                <div style="font-weight:600;">${escapeHTML(h.title)}</div>
                                <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#86868b;">
                                    <span style="text-transform:capitalize;">${toolMap[h.toolId]?.name || h.toolId}</span>
                                    <span>${timeAgo(h.date)}</span>
                                </div>
                            </div>
                            <span style="color:var(--accent); font-size:1.2rem;">→</span>
                        </a>
                    `).join('')}
                </div>
            </details>
        ` : ''}
    `;

    app.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.getAttribute('data-id');
            window.location.hash = id; 
        });
    });
}

function router() {
    const hash = window.location.hash.substring(1);
    
    // We must handle cases where LZString output might contain ':', 
    // though compressToEncodedURIComponent is usually safe. 
    // The standard format is toolId:data.
    const firstColon = hash.indexOf(':');
    let toolId = hash; 
    let data = null;

    if (firstColon > -1) {
        toolId = hash.substring(0, firstColon);
        data = hash.substring(firstColon + 1);
    }

    app.innerHTML = ''; 

    if (!toolId) { renderDashboard(); } 
    else if (toolId === 'grocery') { initGrocery(app, data); } 
    else if (toolId === 'chores') { initChores(app, data); } 
    else if (toolId === 'recipes') { initRecipes(app, data); } 
    else if (toolId === 'lockbox') { initLockbox(app, data); } 
    else if (toolId === 'itinerary') { initItinerary(app, data); }
    else if (toolId === 'emergency') { initEmergency(app, data); }
    else if (toolId === 'packing') { initPacking(app, data); } 
    else if (toolId === 'wishlist') { initWishlist(app, data); }
    else { renderDashboard(); }
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);