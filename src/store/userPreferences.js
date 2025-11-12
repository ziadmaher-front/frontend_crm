// Lightweight user preferences store using localStorage
// Provides getters/setters for Quick Actions preferences (categories and ordering)

const STORAGE_KEY = 'user_prefs_quick_actions_v1';

const defaultPrefs = {
  categories: ['Calls', 'Email', 'Messaging', 'Schedule'],
  order: {
    Calls: ['Log Activity', 'Follow-up'],
    Email: ['Send Email', 'Follow-up'],
    Messaging: ['WhatsApp', 'Follow-up'],
    Schedule: ['Schedule Task', 'Schedule Meeting', 'Follow-up']
  }
};

export function getQuickActionsPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultPrefs };
    const parsed = JSON.parse(raw);
    // Basic validation/merge with defaults
    return {
      categories: Array.isArray(parsed.categories) ? parsed.categories : defaultPrefs.categories,
      order: { ...defaultPrefs.order, ...(parsed.order || {}) }
    };
  } catch (e) {
    return { ...defaultPrefs };
  }
}

export function saveQuickActionsPrefs(prefs) {
  try {
    const merged = {
      categories: Array.isArray(prefs.categories) ? prefs.categories : defaultPrefs.categories,
      order: { ...defaultPrefs.order, ...(prefs.order || {}) }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch (e) {
    // no-op
    return { ...defaultPrefs };
  }
}

