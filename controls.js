const movementKeys = { w: 'ArrowUp', a: 'ArrowLeft', s: 'ArrowDown', d: 'ArrowRight' };

function gameKey(event) {
  const target = event.target;
  if (event.defaultPrevented || event.isComposing || event.metaKey || event.ctrlKey || event.altKey ||
      target.isContentEditable || target.closest?.('input, textarea, select')) return '';
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  return Object.hasOwn(movementKeys, key) ? movementKeys[key] : key;
}

// Null actions are held controls sampled by the game's animation loop.
function bindGameKeys(actions) {
  const down = new Map();
  const keyId = event => event.code || event.key.toLowerCase();
  window.addEventListener('keydown', event => {
    const key = gameKey(event);
    if (!Object.hasOwn(actions, key)) return;
    event.preventDefault();
    down.set(keyId(event), key);
    actions[key]?.(event);
  });
  window.addEventListener('keyup', event => down.delete(keyId(event)));
  window.addEventListener('blur', () => down.clear());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) down.clear();
  });
  return function isHeld(key) {
    for (const value of down.values()) if (value === key) return true;
    return false;
  };
}

// Native buttons and links keep their usual Return/Space activation and Tab order.
function enableGridNavigation(grid, selector, enabled = () => true) {
  window.addEventListener('keydown', event => {
    const key = gameKey(event);
    if (!key.startsWith('Arrow') || !enabled() || document.querySelector('.overlay:not(.hide)')) return;
    const items = [...grid.querySelectorAll(selector)];
    const available = item => !item.disabled && getComputedStyle(item).visibility !== 'hidden';
    const current = items.indexOf(document.activeElement);
    const columns = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns, ArrowDown: columns }[key];
    if (!step || !items.length) return;
    event.preventDefault();
    if (current < 0) { items.find(available)?.focus(); return; }
    const horizontal = key === 'ArrowLeft' || key === 'ArrowRight';
    for (let next = current + step; next >= 0 && next < items.length; next += step) {
      if (horizontal && Math.floor(next / columns) !== Math.floor(current / columns)) break;
      if (available(items[next])) { items[next].focus(); break; }
    }
  });
}
