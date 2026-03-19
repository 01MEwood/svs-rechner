// ─── SVS Rechner Tracking ───────────────────
// Tracks funnel steps, info-button clicks, and completion rate.
// Data stored in localStorage. Optional: POST to webhook for aggregation.

const STORAGE_KEY = 'svs-tracking';
const STATS_KEY = 'svs-stats';
const RATED_KEY = 'svs-rated';

// ── Funnel Tracking ──

function getTrackingData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { events: [], sessionId: crypto.randomUUID?.() || Date.now().toString() };
  } catch {
    return { events: [], sessionId: Date.now().toString() };
  }
}

function saveTrackingData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

export function trackEvent(action, label = '', value = 0) {
  const data = getTrackingData();
  data.events.push({
    action,
    label,
    value,
    time: new Date().toISOString(),
  });
  // Keep last 200 events max
  if (data.events.length > 200) data.events = data.events.slice(-200);
  saveTrackingData(data);
}

export function trackStep(stepIndex, stepName) {
  trackEvent('step_view', stepName, stepIndex);
}

export function trackInfoClick(infoKey) {
  trackEvent('info_click', infoKey);
}

export function trackShare(method) {
  trackEvent('share', method);
}

export function trackComplete(rate) {
  trackEvent('calculation_complete', 'rate', Math.round(rate * 100) / 100);
}

// ── Stats (Views + Ratings) ──

export function getStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? JSON.parse(raw) : { views: 0, totalRatings: 0, sumStars: 0 };
  } catch {
    return { views: 0, totalRatings: 0, sumStars: 0 };
  }
}

export function incrementViews() {
  const stats = getStats();
  stats.views = (stats.views || 0) + 1;
  try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch {}
  return stats;
}

export function submitRating(stars) {
  const stats = getStats();
  stats.totalRatings = (stats.totalRatings || 0) + 1;
  stats.sumStars = (stats.sumStars || 0) + stars;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    localStorage.setItem(RATED_KEY, '1');
  } catch {}
  return stats;
}

export function hasUserRated() {
  try { return !!localStorage.getItem(RATED_KEY); } catch { return false; }
}

// ── Funnel Summary (for debugging / analytics) ──

export function getFunnelSummary() {
  const data = getTrackingData();
  const steps = data.events.filter(e => e.action === 'step_view');
  const infos = data.events.filter(e => e.action === 'info_click');
  const completions = data.events.filter(e => e.action === 'calculation_complete');
  return {
    totalStepViews: steps.length,
    maxStepReached: steps.length > 0 ? Math.max(...steps.map(s => s.value)) : 0,
    infoClicks: infos.map(i => i.label),
    completions: completions.length,
    avgRate: completions.length > 0
      ? completions.reduce((s, c) => s + c.value, 0) / completions.length
      : 0,
  };
}
