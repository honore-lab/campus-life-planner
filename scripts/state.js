// state.js
import { loadData, saveData, loadSettings, saveSettings } from './storage.js';
import { validateRecord, normalizeTitle } from './validators.js';

const makeId = () => 'rec_' + Math.random().toString(36).slice(2,10);

export function initialState(){
  const stored = loadData();
  const items = stored && Array.isArray(stored) ? stored : [];
  return {
    items,
    settings: loadSettings()
  };
}

export function addOrUpdate(state, payload){
  const now = new Date().toISOString();
  const rec = {
    id: payload.id || makeId(),
    title: normalizeTitle(payload.title),
    date: payload.date,
    duration: Number(payload.duration),
    tag: payload.tag,
    notes: payload.notes || '',
    createdAt: payload.createdAt || now,
    updatedAt: now
  };
  const errs = validateRecord(rec);
  if (errs.length) return { ok:false, errors: errs };

  const i = state.items.findIndex(x => x.id === rec.id);
  if (i >= 0) state.items[i] = rec; else state.items.unshift(rec);
  saveData(state.items);
  return { ok:true, rec };
}

export function deleteRecord(state, id){
  state.items = state.items.filter(r => r.id !== id);
  saveData(state.items);
}

export function importData(state, arr){
  if (!Array.isArray(arr)) return { ok:false, error:'Invalid JSON (not array)'};
  const errors = [];
  const normalized = [];
  for (const r of arr){
    const rec = {
      id: r.id || makeId(),
      title: normalizeTitle(r.title || ''),
      date: r.date || '',
      duration: Number(r.duration || 0),
      tag: r.tag || 'other',
      notes: r.notes || '',
      createdAt: r.createdAt || new Date().toISOString(),
      updatedAt: r.updatedAt || new Date().toISOString()
    };
    const errs = validateRecord(rec);
    if (errs.length) errors.push({ id: rec.id, errors: errs });
    normalized.push(rec);
  }
  if (errors.length) return { ok:false, errors };
  state.items = normalized;
  saveData(state.items);
  return { ok:true };
}

export function saveSettingsState(state, settings){
  state.settings = Object.assign({}, state.settings || {}, settings);
  saveSettings(state.settings);
}

export function stats(state){
  const total = state.items.length;
  const sum = state.items.reduce((s,r) => s + Number(r.duration || 0), 0);
  const tagCounts = {};
  for (const r of state.items){ tagCounts[r.tag] = (tagCounts[r.tag]||0) + 1; }
  const topTag = Object.entries(tagCounts).sort((a,b)=>b[1]-a[1])[0];
  return {
    total, sum, topTag: topTag ? topTag[0] : '—'
  };
}
