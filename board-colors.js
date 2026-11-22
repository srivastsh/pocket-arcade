// Canvas drawing uses resolved colors because canvas does not resolve CSS var() values.
const boardColors = {};
function readBoardColors() {
  const style = getComputedStyle(document.documentElement);
  for (const name of ['text','sub','line','cell','blue','green','red','orange','yellow','purple',
                      'teal','pink','indigo','wood','grass','water','road','sand','cloud']) {
    boardColors[name] = style.getPropertyValue('--' + name).trim();
  }
}
readBoardColors();
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  readBoardColors();
  window.dispatchEvent(new Event('boardcolorschange'));
});
