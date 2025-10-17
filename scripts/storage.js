// storage.js
const KEY = 'clp:data:v1';
const SETTINGS_KEY = 'clp:settings:v1';

export const loadData = () => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveData = (data) => {
  localStorage.setItem(KEY, JSON.stringify(data));
};

export const loadSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : { cap: null, units: 'minutes' };
  } catch {
    return { cap: null, units: 'minutes' };
  }
};

export const saveSettings = (s) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
};

export const exportJSON = (data) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  return url;
};
