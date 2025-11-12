const STORAGE_KEY = 'crm.savedViews';

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch (e) {
    return {};
  }
}

function writeAll(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // ignore
  }
}

export function getSavedViews(entity) {
  const all = readAll();
  const views = all[entity] || [];
  return Array.isArray(views) ? views : [];
}

export function saveView(entity, viewDef) {
  const all = readAll();
  const existing = Array.isArray(all[entity]) ? all[entity] : [];
  const idx = existing.findIndex(v => v.name === viewDef.name);
  if (idx >= 0) {
    existing[idx] = viewDef;
  } else {
    existing.push(viewDef);
  }
  all[entity] = existing;
  writeAll(all);
}

export function deleteView(entity, name) {
  const all = readAll();
  const existing = Array.isArray(all[entity]) ? all[entity] : [];
  all[entity] = existing.filter(v => v.name !== name);
  writeAll(all);
}

