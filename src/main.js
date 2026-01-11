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
    { id: 'grocery', name: 'Grocery List', icon: 'shopping-cart' },
    { id: 'chores', name: 'Chore List', icon: 'list-checks' },
    { id: 'recipes', name: 'Recipe', icon: 'chef-hat' },
    { id: 'packing', name: 'Packing List', icon: 'package' },
    { id: 'itinerary', name: 'Travel Plan', icon: 'plane' },
    { id: 'wishlist', name: 'Wishlist', icon: 'gift' },
    { id: 'emergency', name: 'Emergency Info', icon: 'heart-pulse' },
    { id: 'lockbox', name: 'Lockbox', icon: 'lock' },
];

function renderDashboard() {
    const history = getHistory();
    const toolMap = tools.reduce((acc, t) => ({ ...acc, [t.id]: t }), {});

    app.innerHTML = `
        <header>
            <h1>Nestly</h1>
            <p class="font-mono">Simple tools for your family.</p>
        </header>

        <div class="grid">
            ${tools.map(t => `
                <div class="card" data-id="${t.id}">
                    <span class="icon"><i data-lucide="${t.icon}"></i></span>
                    <span class="label">${t.name}</span>
                </div>
            `).join('')}
        </div>

        <details>
            <summary>
                <span>Saved Lists</span>
                <span class="hint">(Click to show)</span>
            </summary>

            <div style="margin-top: 15px;">
                ${history.length > 0 ? history.map(h => `
                    <a href="${h.hash}" class="history-item">
                        <span class="history-icon"><i data-lucide="${toolMap[h.toolId]?.icon || 'file'}"></i></span>
                        <div style="flex:1; position:relative; z-index:2;">
                            <div style="font-weight:600;">${escapeHTML(h.title)}</div>
                            <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-muted);">
                                <span class="tech-tag-dashed" style="padding:2px 6px;">${toolMap[h.toolId]?.name || h.toolId}</span>
                                <span>${timeAgo(h.date)}</span>
                            </div>
                        </div>
                        <span style="color:var(--text-muted); position:relative; z-index:2;"><i data-lucide="arrow-right" style="width:18px; height:18px;"></i></span>
                    </a>
                `).join('') : '<div style="color:var(--text-muted); padding:10px; text-align:center; font-style:italic;">No saved lists yet. start using tools to save them!</div>'}
            </div>
        </details>
    `;

    app.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.getAttribute('data-id');
            window.location.hash = id;
        });
    });

    // Initialize Lucide icons
    if (window.lucide) lucide.createIcons();
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