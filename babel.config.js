module.exports = {
  presets: ["next/babel"],
  plugins: [
    "@babel/plugin-transform-runtime",
    "@babel/plugin-transform-class-properties",
    "@babel/plugin-transform-object-rest-spread",
    "@babel/plugin-syntax-dynamic-import",
    "@babel/plugin-syntax-import-attributes",
  ],
};
