const { parse, isValid, format } = require("date-fns");

const processDate = (dateString) => {
  if (!dateString) return null;

  const trimmedDate = dateString;

  const parsedDate = parse(trimmedDate, "yyyy-MM-dd", new Date());

  if (!isValid(parsedDate)) return null;

  return format(parsedDate, "yyyy-MM-dd");
};

module.exports = processDate;
