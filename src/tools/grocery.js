import { escapeHTML } from '../utils.js';
import { initGenericList } from './genericList.js';

export function initGrocery(container, rawData) {
    initGenericList(container, rawData, {
        toolId: 'grocery',
        defaultTitle: 'Grocery List',
        inputHTML: `<input type="text" id="i-in" placeholder="Add something..." style="flex:1" autofocus>`,
        
        createItem: (con) => {
            const val = con.querySelector('#i-in').value.trim();
            if (!val) return null;
            con.querySelector('#i-in').value = '';
            return { text: val, done: false };
        },
        
        renderItem: (item) => `<span>${escapeHTML(item.text)}</span>`
    });
}