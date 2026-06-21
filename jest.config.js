/**
 * @type { import('jest').Config }
 */
const config = {
  "transformIgnorePatterns": [
    "node_modules/(?!@ngrx|(?!deck.gl)|ng-dynamic)",
  ],
};

module.exports = config;
