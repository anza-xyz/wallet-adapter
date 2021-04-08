module.exports = {
  clean: false,
  cache: false,
  'check-coverage': true,
  reporter: 'lcov',
  all: true,
  lines: 100,
  functions: 77, // coverage is actually higher than this, there is a yarn/nyc issue
  statements: 100,
  branches: 100,
  include: ["src/**"],
  reportDir: `${__dirname}/coverage`,
};
