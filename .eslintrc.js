/* eslint-env node */

module.exports = {
  extends: ["eslint:recommended", "prettier", "plugin:prettier/recommended"],
  env: {
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  rules: {
    "no-unused-vars": ["error", { varsIgnorePattern: "^_" }],
    "no-console": "off",
  },
};
