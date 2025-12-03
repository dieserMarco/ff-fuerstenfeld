const searchInput = document.getElementById('searchInput');
const filterGruppe = document.getElementById('filterGruppe');
const filterBundesland = document.getElementById('filterBundesland');
const sortSelect = document.getElementById('sortSelect');
const resultsList = document.getElementById('resultsList');
const resultsCount = document.getElementById('resultsCount');
const statusText = document.getElementById('statusText');

let sprechgruppen = [];
let isLoaded = false;

// JSON laden
fetch('sprechgruppen.json')
  .then(res => {
    if (!res.ok) throw new Error('Fehler beim Laden');
    return res.json();
  })
  .then(data => {
    sprechgruppen = Array.isArray(data) ? data : [];
    isLoaded = true;
    statusText.textContent = 'Daten geladen. Tippe oben, um zu suchen.';
    render();
  })
  .catch(err => {
    console.error(err);
    statusText.textContent = 'Fehler beim Laden der Daten. Prüfe sprechgruppen.json.';
  });

// Suche + Filter + Sortierung anwenden
function getFiltered() {
  const q = searchInput.value.trim().toLowerCase();
  const gruppe = filterGruppe.value;
  const bl = filterBundesland.value;
  const sortBy = sortSelect.value;

  let list = sprechgruppen.slice();

  list = list.filter(item => {
    const nr = String(item.nummer || '');
    const nm = String(item.name || '');
    const text = (nr + ' ' + nm).toLowerCase();

    const matchesSearch = !q || text.includes(q);
    const matchesGruppe = !gruppe || item.gruppe === gruppe;
    const matchesBL = !bl || item.bundesland === bl;

    return matchesSearch && matchesGruppe && matchesBL;
  });

  list.sort((a, b) => {
    if (sortBy === 'nummer') {
      const na = Number(a.nummer) || 0;
      const nb = Number(b.nummer) || 0;
      return na - nb;
    } else {
      const sa = (a.name || '').toLowerCase();
      const sb = (b.name || '').toLowerCase();
      return sa.localeCompare(sb);
    }
  });

  return list;
}

// Rendering
function render() {
  if (!isLoaded) return;

  const list = getFiltered();
  resultsList.innerHTML = '';

  resultsCount.textContent = `${list.length} Treffer`;

  if (list.length === 0) {
    const li = document.createElement('li');
    li.className = 'no-results';
    li.textContent = 'Keine Sprechgruppe gefunden. Eingabe prüfen.';
    resultsList.appendChild(li);
    return;
  }

  for (const item of list) {
    const li = document.createElement('li');
    li.className = 'result-item';

    const mainline = document.createElement('div');
    mainline.className = 'result-mainline';

    // Name links
    const nameEl = document.createElement('div');
    nameEl.className = 'result-name-left';
    nameEl.textContent = item.name || '';

    // Nummer rechts
    const numEl = document.createElement('div');
    numEl.className = 'result-number-right';
    numEl.textContent = item.nummer || '';

    mainline.appendChild(nameEl);
    mainline.appendChild(numEl);

    const meta = document.createElement('div');
    meta.className = 'result-meta';

    const badgeGruppe = document.createElement('span');
    badgeGruppe.className = 'badge badge-accent';
    badgeGruppe.textContent = item.gruppe || '–';

    const badgeBL = document.createElement('span');
    badgeBL.className = 'badge';
    badgeBL.textContent = item.bundesland || '–';

    meta.appendChild(badgeGruppe);
    meta.appendChild(badgeBL);

    if (item.ordner) {
      const badgeOrdner = document.createElement('span');
      badgeOrdner.className = 'badge';
      badgeOrdner.textContent = item.ordner;
      meta.appendChild(badgeOrdner);
    }

    if (item.bereich) {
      const badgeBereich = document.createElement('span');
      badgeBereich.className = 'badge';
      badgeBereich.textContent = `Bereich: ${item.bereich}`;
      meta.appendChild(badgeBereich);
    }

    li.appendChild(mainline);
    li.appendChild(meta);
    resultsList.appendChild(li);
  }
}

// Events (live Suche)
searchInput.addEventListener('input', render);
filterGruppe.addEventListener('change', render);
filterBundesland.addEventListener('change', render);
sortSelect.addEventListener('change', render);
