import { escapeHTML } from '../utils.js';
import { initGenericList } from './genericList.js';

export function initChores(container, rawData) {
    initGenericList(container, rawData, {
        toolId: 'chores',
        defaultTitle: 'Weekly Chores',
        columnInput: true, // Stack inputs vertically
        inputHTML: `
            <div style="display:flex; gap:10px;">
                <input type="text" id="chore-in" placeholder="What needs doing?" style="flex:2">
                <input type="text" id="who-in" placeholder="Who?" style="flex:1">
            </div>
        `,

        createItem: (con) => {
            const task = con.querySelector('#chore-in').value.trim();
            const who = con.querySelector('#who-in').value.trim();
            if (!task) return null;
            con.querySelector('#chore-in').value = '';
            con.querySelector('#who-in').value = '';
            return { task, who, done: false };
        },

        renderItem: (item) => `
            <div style="display:flex; flex-direction:column;">
                <span style="font-weight:600;">${escapeHTML(item.task)}</span>
                <span style="font-size:0.8rem; color:var(--accent);">${item.who ? '👤 ' + escapeHTML(item.who) : 'Unassigned'}</span>
            </div>
        `
    });
}