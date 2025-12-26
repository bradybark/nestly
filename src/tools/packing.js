// src/tools/packing.js
export function initPacking(app) {
  // Load data from localStorage or start empty
  let items = JSON.parse(localStorage.getItem('nestly_packing')) || [];

  function render() {
    app.innerHTML = `
      <a href="#" class="back-btn">← Back to Dashboard</a>
      <div class="tool-container">
        <div class="tool-header">
            <h2>📦 Packing List</h2>
        </div>
        
        <form id="add-form" class="input-group">
            <input type="text" id="item-input" placeholder="Item name..." required>
            <input type="number" id="qty-input" value="1" min="1" style="width: 60px;">
            <button type="submit">Add</button>
        </form>

        <ul class="list-container" id="packing-list">
            ${items.map(item => `
                <li class="${item.packed ? 'completed' : ''}">
                    <div class="item-info" data-id="${item.id}">
                        <input type="checkbox" ${item.packed ? 'checked' : ''}>
                        <span>${item.name} <small>(x${item.qty})</small></span>
                    </div>
                    <button class="delete-btn" data-id="${item.id}">🗑️</button>
                </li>
            `).join('')}
        </ul>
      </div>
    `;

    // Attach Event Listeners
    document.getElementById('add-form').addEventListener('submit', addItem);
    
    document.querySelectorAll('.item-info input').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const id = parseInt(e.target.closest('.item-info').dataset.id);
            togglePacked(id);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            deleteItem(id);
        });
    });
  }

  function addItem(e) {
    e.preventDefault();
    const input = document.getElementById('item-input');
    const qty = document.getElementById('qty-input');
    
    if (!input.value.trim()) return;

    items.push({
        id: Date.now(),
        name: input.value.trim(),
        qty: qty.value,
        packed: false
    });

    save();
    render();
  }

  function togglePacked(id) {
    items = items.map(item => 
        item.id === id ? { ...item, packed: !item.packed } : item
    );
    save();
    render();
  }

  function deleteItem(id) {
    items = items.filter(item => item.id !== id);
    save();
    render();
  }

  function save() {
    localStorage.setItem('nestly_packing', JSON.stringify(items));
  }

  // Initial Render
  render();
}