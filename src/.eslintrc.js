/* eslint-env node */

module.exports = {
  extends: "eslint:recommended",

  // Needed because of the use of "import.meta.url" when calling "new Worker()".
  // https://stackoverflow.com/questions/54337576/eslint-import-meta-causes-fatal-parsing-error
  parser: "babel-eslint",

  env: {
    browser: true,
    jquery: true
  }
}
