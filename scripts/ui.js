// ui.js
import { compileRegex, highlight } from './search.js';
import { addOrUpdate, deleteRecord, importData, stats, saveSettingsState } from './state.js';
import { exportJSON } from './storage.js';

let appState;
let root;

export function init(s, rootEl){
  appState = s;
  root = rootEl;
  bindEvents();
  renderAll();
}

function bindEvents(){
  const form = document.getElementById('item-form');
  form.addEventListener('submit', onSave);

  document.getElementById('clear-btn').addEventListener('click', () => form.reset());

  document.getElementById('search-input').addEventListener('input', renderAll);
  document.getElementById('ci-toggle').addEventListener('change', renderAll);
  document.getElementById('sort-select').addEventListener('change', renderAll);

  document.getElementById('save-settings').addEventListener('click', onSaveSettings);
  document.getElementById('export-json').addEventListener('click', onExport);
  document.getElementById('import-file').addEventListener('change', onImport);
}

function onSave(e){
  e.preventDefault();
  const id = document.getElementById('record-id').value || undefined;
  const payload = {
    id,
    title: document.getElementById('title').value,
    date: document.getElementById('date').value,
    duration: document.getElementById('duration').value,
    tag: document.getElementById('tag').value,
    notes: document.getElementById('notes').value
  };
  const res = addOrUpdate(appState, payload);
  const errorsEl = document.getElementById('form-errors');
  errorsEl.textContent = '';
  if (!res.ok){
    errorsEl.textContent = res.errors.join(' · ');
    return;
  }
  // reset form and re-render
  e.target.reset();
  document.getElementById('record-id').value = '';
  renderAll();
  announce('Saved.');
}

function onSaveSettings(){
  const cap = document.getElementById('cap').value;
  const units = document.getElementById('units').value;
  const s = { cap: cap ? Number(cap) : null, units };
  saveSettingsState(appState, s);
  document.getElementById('settings-status').textContent = 'Settings saved.';
  renderAll();
}

function onExport(){
  const url = exportJSON(appState.items);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'campus-life-planner-export.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  announce('Exported JSON.');
}

async function onImport(e){
  const file = e.target.files[0];
  if (!file) return;
  try {
    const txt = await file.text();
    const parsed = JSON.parse(txt);
    const res = importData(appState, parsed);
    if (!res.ok){
      document.getElementById('settings-status').textContent = 'Import errors: ' + JSON.stringify(res.errors);
    } else {
      document.getElementById('settings-status').textContent = 'Import successful.';
      renderAll();
    }
  } catch (err){
    document.getElementById('settings-status').textContent = 'Import failed: invalid JSON.';
  } finally {
    e.target.value = '';
  }
}

function announce(text){
  const a = document.getElementById('aria-live');
  a.textContent = text;
}

export function renderAll(){
  renderStats();
  renderList();
  renderFormFromSettings();
}

function renderStats(){
  const s = stats(appState);
  document.getElementById('total-records').textContent = s.total;
  document.getElementById('sum-duration').textContent = s.sum;
  document.getElementById('top-tag').textContent = s.topTag;
  // cap logic
  const cap = appState.settings && appState.settings.cap;
  if (cap && s.sum > cap){
    document.getElementById('cap-status').textContent = `Over by ${s.sum - cap} ${appState.settings.units||'min'}`;
    document.getElementById('cap-status').setAttribute('role','alert');
  } else if (cap){
    document.getElementById('cap-status').textContent = `Remaining ${ (cap - s.sum) } ${appState.settings.units||'min'}`;
    document.getElementById('cap-status').setAttribute('role','status');
  } else {
    document.getElementById('cap-status').textContent = 'No cap';
  }

  renderTrend();
}

function renderTrend(){
  const chart = document.getElementById('trend-chart');
  // simple JS/CSS "bars" for last 7 days
  const days = 7;
  const buckets = Array.from({length:days},()=>0);
  const now = new Date();
  for (const r of appState.items){
    const d = new Date(r.date);
    const diff = Math.floor((dateOnly(now)-dateOnly(d))/(1000*60*60*24));
    if (diff >=0 && diff < days){
      buckets[diff] += Number(r.duration||0);
    }
  }
  // build bars
  chart.innerHTML = '';
  const max = Math.max(...buckets,1);
  buckets.forEach((v,i)=>{
    const bar = document.createElement('div');
    bar.className = 'trend-bar';
    const pct = Math.round((v/max)*100);
    bar.style.height = (30 + pct) + 'px';
    bar.title = `${i} days ago: ${v} min`;
    bar.textContent = v?v:'';
    chart.appendChild(bar);
  });
}

function dateOnly(d){ return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

function renderFormFromSettings(){
  // load settings to form
  const capEl = document.getElementById('cap');
  const unitsEl = document.getElementById('units');
  if (appState.settings){
    capEl.value = appState.settings.cap||'';
    unitsEl.value = appState.settings.units || 'minutes';
  }
}

function renderList(){
  const list = document.getElementById('records-list');
  list.innerHTML = '';
  const q = document.getElementById('search-input').value;
  const ci = document.getElementById('ci-toggle').checked;
  const sort = document.getElementById('sort-select').value;
  const re = compileRegex(q, ci? 'i' : '');

  let items = [...appState.items];

  // sorting
  items.sort((a,b) => {
    switch(sort){
      case 'date_asc': return a.date.localeCompare(b.date);
      case 'date_desc': return b.date.localeCompare(a.date);
      case 'title_asc': return a.title.localeCompare(b.title);
      case 'title_desc': return b.title.localeCompare(a.title);
      case 'duration_asc': return Number(a.duration) - Number(b.duration);
      case 'duration_desc': return Number(b.duration) - Number(a.duration);
      default: return 0;
    }
  });

  // filter by regex if provided (search across title, tag, notes)
  if (re){
    items = items.filter(it => re.test(it.title) || re.test(it.tag) || re.test(it.notes) || re.test(String(it.duration)));
  }

  // render items
  if (items.length === 0){
    list.innerHTML = '<p>No records found.</p>';
    return;
  }
  for (const r of items){
    const card = document.createElement('article');
    card.className = 'item-card';
    card.tabIndex = 0;

    const left = document.createElement('div');
    left.className = 'card-left';
    left.innerHTML = `
      <div class="card-row">
        <div>
          <div class="title">${re ? highlight(r.title, re) : escapeHtml(r.title)}</div>
          <div class="card-meta">
            <span>${r.date}</span>
            <span>• ${r.duration} min</span>
            <span>• ${re ? highlight(r.tag, re) : escapeHtml(r.tag)}</span>
          </div>
        </div>
      </div>
      <div class="notes">${re ? highlight(r.notes || '', re) : escapeHtml(r.notes || '')}</div>
    `;

    const actions = document.createElement('div');
    actions.className = 'card-actions';
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', ()=> populateEdit(r));
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.addEventListener('click', ()=> {
      if (confirm('Delete this record?')) {
        deleteRecord(appState, r.id);
        renderAll();
        announce('Deleted.');
      }
    });

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    card.appendChild(left);
    card.appendChild(actions);
    list.appendChild(card);
  }
}

// small helpers for safe html
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function populateEdit(r){
  document.getElementById('record-id').value = r.id;
  document.getElementById('title').value = r.title;
  document.getElementById('date').value = r.date;
  document.getElementById('duration').value = r.duration;
  document.getElementById('tag').value = r.tag;
  document.getElementById('notes').value = r.notes;
  window.location.hash = '#add';
  document.getElementById('title').focus();
}
