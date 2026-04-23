export const normalizeRole = (role) => String(role || '').trim().toLowerCase();

export const isAdminLikeRole = (role) => {
  const normalized = normalizeRole(role);
  return normalized === 'admin' || normalized === 'demo';
};

export const getEffectiveRole = (role) => {
  return isAdminLikeRole(role) ? 'admin' : normalizeRole(role);
};

export const getDemoRemainingTime = (trialEndsAt, now = Date.now()) => {
  if (!trialEndsAt) {
    return null;
  }

  const endTime = new Date(trialEndsAt).getTime();
  if (Number.isNaN(endTime)) {
    return null;
  }

  const remainingMs = endTime - now;
  const expired = remainingMs <= 0;
  const safeRemainingMs = Math.max(remainingMs, 0);

  const totalMinutes = Math.floor(safeRemainingMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return {
    expired,
    remainingMs: safeRemainingMs,
    days,
    hours,
    minutes
  };
};
