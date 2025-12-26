// src/main.js
import './style.css';
import { getHistory, escapeHTML } from './utils.js';
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
            <p>Simple tools for your home.</p>
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
            <div style="margin-top: 40px;">
                <h3 style="margin-bottom: 15px; padding-left: 5px;">🕒 Recently Viewed</h3>
                ${history.map(h => `
                    <a href="${h.hash}" class="history-item">
                        <span class="history-icon">${toolMap[h.toolId]?.icon || '📄'}</span>
                        <div style="flex:1;">
                            <div style="font-weight:600;">${escapeHTML(h.title)}</div>
                            <div style="font-size:0.8rem; color:#86868b; text-transform:capitalize;">${toolMap[h.toolId]?.name || h.toolId}</div>
                        </div>
                        <span style="color:var(--accent); font-size:1.2rem;">→</span>
                    </a>
                `).join('')}
            </div>
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
    const [toolId, data] = hash.split(':');

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