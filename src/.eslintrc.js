/* eslint-env node */

module.exports = {
  extends: ["eslint:recommended", "prettier", "plugin:prettier/recommended"],

  // Needed because of the use of "import.meta.url" when calling "new Worker()".
  // https://stackoverflow.com/questions/54337576/eslint-import-meta-causes-fatal-parsing-error
  parser: "@babel/eslint-parser",
  parserOptions: {
    requireConfigFile: false,
  },

  env: {
    browser: true,
    jquery: true,
  },
};
