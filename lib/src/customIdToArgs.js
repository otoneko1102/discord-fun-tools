function customIdToArgs(id) {
  return id.split("-").slice(1);
}

module.exports = customIdToArgs;
