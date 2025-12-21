export default function checkDb(pool) {
  return (req, res, next) => {
    if (!pool) {
      return res
        .status(503)
        .json({ message: 'Banco de dados indisponível.' });
    }
    next();
  };
}
