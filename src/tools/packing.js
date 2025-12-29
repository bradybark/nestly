import { escapeHTML } from '../utils.js';
import { initGenericList } from './genericList.js';

export function initPacking(container, rawData) {
    initGenericList(container, rawData, {
        toolId: 'packing',
        defaultTitle: 'Packing List',
        inputHTML: `
            <input type="text" id="item-input" placeholder="Item name..." style="flex:2" autofocus>
            <input type="number" id="qty-input" value="1" min="1" style="width: 60px;">
        `,
        
        createItem: (con) => {
            const name = con.querySelector('#item-input').value.trim();
            const qty = con.querySelector('#qty-input').value;
            if (!name) return null;
            con.querySelector('#item-input').value = '';
            // keep qty as 1
            con.querySelector('#qty-input').value = '1';
            return { name, qty, done: false };
        },

        renderItem: (item) => `
            <span>${escapeHTML(item.name)} 
            ${item.qty > 1 ? `<small style="color:var(--accent); font-weight:600;">(x${item.qty})</small>` : ''}
            </span>
        `
    });
}