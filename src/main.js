// src/main.js
import './style.css';
import { initGrocery } from './tools/grocery.js';
import { initChores } from './tools/chores.js';
import { initRecipes } from './tools/recipes.js';
import { initLockbox } from './tools/lockbox.js';
import { initItinerary } from './tools/itinerary.js';
import { initEmergency } from './tools/emergency.js';
import { initPacking } from './tools/packing.js'; // 1. Import Packing Tool

const app = document.getElementById('app');

// Tool Definitions
const tools = [
    { id: 'grocery', name: 'Grocery List', icon: '🛒' },
    { id: 'chores', name: 'Chore-O-Matic', icon: '🧹' },
    { id: 'recipes', name: 'Secret Recipes', icon: '📖' },
    { id: 'itinerary', name: 'Travel Plan', icon: '✈️' },
    { id: 'lockbox', name: 'Lockbox', icon: '🔒' },
    { id: 'emergency', name: 'Emergency Info', icon: '🏥' },
    { id: 'wishlist', name: 'Wishlist', icon: '🎁' },
    { id: 'packing', name: 'Packing List', icon: '📦' },
];

/**
 * Renders the main dashboard grid.
 */
function renderDashboard() {
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
    `;

    app.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.getAttribute('data-id');
            window.location.hash = id; 
        });
    });
}

/**
 * The Router
 */
function router() {
    const hash = window.location.hash.substring(1);
    const [toolId, data] = hash.split(':');

    app.innerHTML = ''; 

    if (!toolId) {
        renderDashboard();
    } 
    else if (toolId === 'grocery') {
        initGrocery(app, data); 
    } 
    else if (toolId === 'chores') {
        initChores(app, data); 
    } 
    else if (toolId === 'recipes') {
        initRecipes(app, data); 
    } 
    else if (toolId === 'lockbox') {
        initLockbox(app, data); 
    } 
    else if (toolId === 'itinerary') {
        initItinerary(app, data); 
    }
    else if (toolId === 'emergency') {
        initEmergency(app, data); 
    }
    else if (toolId === 'packing') { // 2. Add Route Handler
        initPacking(app, data);
    } 
    else {
        app.innerHTML = `
            <a href="#" class="back-btn">← Back to Dashboard</a>
            <div style="text-align: center; padding-top: 50px;">
                <span style="font-size: 4rem; display: block; margin-bottom: 20px;">🚧</span>
                <h2 style="font-size: 2rem; margin-bottom: 10px;">
                    ${toolId ? toolId.charAt(0).toUpperCase() + toolId.slice(1) : 'Unknown'}
                </h2>
                <p style="color: #86868b;">This tool is coming soon to Nestly!</p>
            </div>
        `;
    }
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);