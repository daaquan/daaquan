// Open linked notes, including direct links from RSS readers.
function openLinkedNote() {
  const id = window.location.hash.slice(1);
  const note = document.getElementById(id);
  if (note instanceof HTMLDetailsElement) note.open = true;
}
window.addEventListener('hashchange', openLinkedNote);
openLinkedNote();
