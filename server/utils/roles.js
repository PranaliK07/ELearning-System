const normalizeRole = (role) => String(role || '').trim().toLowerCase();

const isAdminLikeRole = (role) => {
  const normalized = normalizeRole(role);
  return normalized === 'admin' || normalized === 'demo';
};

const hasRoleAccess = (userRole, requiredRole) => {
  const normalizedUserRole = normalizeRole(userRole);
  const normalizedRequiredRole = normalizeRole(requiredRole);

  if (!normalizedRequiredRole) return false;
  
  // Basic match
  if (normalizedUserRole === normalizedRequiredRole) return true;

  // Admin and Demo users are super-users with full access.
  if (normalizedUserRole === 'admin' || normalizedUserRole === 'demo') {
    return true;
  }

  // Teachers can access student-level resources.
  if (normalizedUserRole === 'teacher' && normalizedRequiredRole === 'student') {
    return true;
  }

  return false;
};

module.exports = {
  normalizeRole,
  isAdminLikeRole,
  hasRoleAccess
};
