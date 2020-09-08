const normalizePath = (...paths) => {
  const path = paths.join('');
  if (path.length === 0) {
    return '/';
  }
  return path.replace(/\/+/g, '/');
};

export default normalizePath;
