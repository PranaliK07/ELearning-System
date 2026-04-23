const normalizeRole = (role) => String(role || '').trim().toLowerCase();

const isAdminLikeRole = (role) => {
  const normalized = normalizeRole(role);
  return normalized === 'admin' || normalized === 'demo';
};

const hasRoleAccess = (userRole, requiredRole) => {
  const normalizedUserRole = normalizeRole(userRole);
  const normalizedRequiredRole = normalizeRole(requiredRole);

  if (!normalizedRequiredRole) return false;
  if (normalizedUserRole === normalizedRequiredRole) return true;

  // Demo users are treated as admin for access checks.
  if (normalizedRequiredRole === 'admin' && normalizedUserRole === 'demo') {
    return true;
  }

  return false;
};

module.exports = {
  normalizeRole,
  isAdminLikeRole,
  hasRoleAccess
};
