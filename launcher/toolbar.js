(() => {
  const header = document.querySelector('header.bar');
  const chips = document.getElementById('chips');
  const wide = matchMedia('(min-width:731px)');
  const bridge = window.webkit.messageHandlers.gameToolbar;
  let previous;
  function sync() {
    const actions = header ? [...header.querySelectorAll('.right button[id]')]
      .filter(button => !button.hidden)
      .map(button => ({
        id: button.id, title: button.textContent.trim(), enabled: !button.disabled,
        toggle: button.hasAttribute('aria-pressed'), pressed: button.getAttribute('aria-pressed') === 'true'
      })) : [];
    const sidebar = !!(window.nativeGlassSidebar && chips && wide.matches);
    const categories = sidebar ? [...chips.children].filter(button => !button.hidden).map(button => ({
      id: button.dataset.f, title: button.textContent, selected: button.getAttribute('aria-pressed') === 'true'
    })) : [];
    const state = {title:document.title, game:!!header, actions, sidebar, categories};
    document.documentElement.classList.toggle('mac-library', sidebar);
    const serialized = JSON.stringify(state);
    if (serialized !== previous) { previous = serialized; bridge.postMessage(state); }
  }
  if (header) document.documentElement.classList.add('mac-game');
  if (header || chips) new MutationObserver(sync).observe(header || chips, {
    subtree:true, childList:true, attributes:true, characterData:true
  });
  wide.addEventListener('change', sync);
  window.addEventListener('pageshow', () => { previous = null; sync(); });
  sync();
})();
