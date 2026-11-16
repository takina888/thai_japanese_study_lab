(function (root) {
  'use strict';
  const memory = new Map();
  const genders = new Set(['male', 'female', 'unspecified']);
  const profileKey = 'tn_profile_v1';

  function get(key, fallback = null) {
    if (memory.has(key)) return memory.get(key);
    try { return root.localStorage.getItem(key) ?? fallback; }
    catch { return fallback; }
  }

  function set(key, value) {
    const text = String(value);
    memory.set(key, text);
    try { root.localStorage.setItem(key, text); return true; }
    catch { return false; }
  }

  function json(key, fallback, { fresh = false } = {}) {
    let value;
    if (fresh) {
      // Progress merges need the latest tab's write, not this tab's cached value.
      // Keep the cache as the fallback when browser storage cannot be read.
      try { value = root.localStorage.getItem(key); }
      catch { value = get(key); }
    } else value = get(key);
    try { return JSON.parse(value) ?? fallback; }
    catch { return fallback; }
  }

  function ids(key) {
    const value = json(key, []);
    return Array.isArray(value) ? value.filter(id => typeof id === 'string') : [];
  }

  function normalizeProfile(value) {
    if (!value || typeof value !== 'object' || !genders.has(value.gender)) return null;
    if (typeof value.nickname !== 'string') return null;
    const nickname = Array.from(value.nickname.replace(/[\u0000-\u001f\u007f]/gu, '').replace(/\s+/gu, ' ').trim()).slice(0, 24).join('');
    const workCourse = value.workCourse === 'service' ? 'service' : 'work';
    return { version: 1, nickname, gender: value.gender, workCourse, completed: true };
  }

  function readProfile() {
    const value = json(profileKey, null);
    if (value?.version !== 1 || value?.completed !== true) return null;
    return normalizeProfile(value);
  }

  function saveProfile(value) {
    const profile = normalizeProfile(value);
    if (!profile) throw new TypeError('Invalid learning profile');
    return { profile, persisted: set(profileKey, JSON.stringify(profile)) };
  }

  root.ThaiNaviPreferences = {
    get, set, json, ids, normalizeProfile, readProfile, saveProfile,
    language: () => get('tn_language') === 'th' ? 'th' : 'ja'
  };
})(typeof window !== 'undefined' ? window : globalThis);
