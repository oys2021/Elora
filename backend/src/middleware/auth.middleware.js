export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: { message: 'You must be signed in to do this', code: 'UNAUTHENTICATED' },
    });
  }
  next();
};


export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: { message: 'You must be signed in to do this', code: 'UNAUTHENTICATED' },
    });
  }
  if (!req.user.isAdmin) {
    return res.status(403).json({
      error: { message: 'You do not have permission to do this', code: 'FORBIDDEN' },
    });
  }
  next();
};
