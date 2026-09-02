const { errorResponse } = require('../utils/responseHandler');

module.exports = (err, req, res, next) => {
  console.error('Internal Error:', err.stack);
  return errorResponse(
    res, 
    process.env.NODE_ENV === 'development' ? err.message : 'Terjadi kesalahan pada server', 
    500
  );
};