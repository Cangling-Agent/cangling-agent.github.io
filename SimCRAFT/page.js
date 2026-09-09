'use strict';

const themeToggle = document.getElementById('theme-toggle');
const preferredTheme = matchMedia('(prefers-color-scheme: dark)');
function displayTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
  themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
}
displayTheme(document.documentElement.dataset.theme || (preferredTheme.matches ? 'dark' : 'light'));
themeToggle.hidden = false;
themeToggle.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  displayTheme(theme);
  try { localStorage.setItem('theme', theme); } catch (_) {}
});
preferredTheme.addEventListener('change', (event) => {
  try { if (localStorage.getItem('theme')) return; } catch (_) {}
  displayTheme(event.matches ? 'dark' : 'light');
});

// Without JavaScript, the anchors navigate to three fully readable result tables.
const tabList = document.querySelector('.result-tabs');
const tabs = Array.from(document.querySelectorAll('.result-tab'));
const panels = Array.from(document.querySelectorAll('.result-panel'));
tabList.setAttribute('role', 'tablist');
tabs.forEach((tab, index) => {
  tab.id = `benchmark-tab-${index}`;
  tab.setAttribute('role', 'tab');
  tab.setAttribute('aria-controls', panels[index].id);
  panels[index].setAttribute('role', 'tabpanel');
  panels[index].setAttribute('aria-labelledby', tab.id);
});
function selectTab(index) {
  tabs.forEach((tab, current) => {
    const selected = current === index;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    panels[current].hidden = !selected;
  });
}
function selectFromHash() {
  const index = panels.findIndex((panel) => `#${panel.id}` === location.hash);
  if (index >= 0) selectTab(index);
}
selectTab(0);
selectFromHash();
window.addEventListener('hashchange', selectFromHash);
tabs.forEach((tab, index) => {
  tab.addEventListener('click', (event) => {
    event.preventDefault();
    selectTab(index);
    try { history.replaceState(null, '', tab.hash); } catch (_) {}
  });
  tab.addEventListener('keydown', (event) => {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    tabs[next].focus();
    tabs[next].click();
  });
});

const copyButton = document.getElementById('copy-citation');
copyButton.hidden = false;
copyButton.addEventListener('click', async () => {
  const citation = document.getElementById('bibtex');
  const status = document.getElementById('copy-status');
  try {
    await navigator.clipboard.writeText(citation.textContent.trim() + '\n');
    status.textContent = 'BibTeX copied.';
  } catch (_) {
    const range = document.createRange();
    range.selectNodeContents(citation);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = 'Citation selected. Press Cmd+C or Ctrl+C to copy, or download the .bib file.';
  }
});
