/* eslint-env node */

module.exports = {
  extends: ["eslint:recommended", "prettier", "plugin:prettier/recommended"],
  env: {
    browser: true,
    jquery: true,
  },
  globals: {
    __APP_VERSION__: "readonly",
  },
};
