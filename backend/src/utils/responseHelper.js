const sendSuccess = (res, statusCode = 200, data = {}, message = '') => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendPaginated = (res, data, total, page, limit) => {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  });
};

const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 10);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

module.exports = { sendSuccess, sendPaginated, getPagination };