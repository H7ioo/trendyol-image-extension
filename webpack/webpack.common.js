const webpack = require("webpack");
const path = require("path");
const glob = require("glob");
const CopyPlugin = require("copy-webpack-plugin");
const srcDir = path.join(__dirname, "..", "src");

function generateEntries(pattern) {
  return glob.sync(pattern, { cwd: srcDir }).reduce((entries, file) => {
    // Extract directory and base name for entry name
    const relativePath = path.relative(srcDir, file);
    const entryName = relativePath
      .replace(/\\/g, "/")
      .replace(/\.(tsx|ts)$/, "");

    entries[entryName] = path.join(srcDir, file);
    return entries;
  }, {});
}

module.exports = {
  entry: {
    popup: path.join(srcDir, "popup.tsx"),
    options: path.join(srcDir, "options.tsx"),
    background: path.join(srcDir, "background.ts"),
    ...generateEntries("content_scripts/**/*.tsx"),
    ...generateEntries("inject_scripts/**/*.ts"),
  },
  output: {
    path: path.join(__dirname, "../dist/js"), // Output all files to the `dist/js` directory
    filename: (pathData) => {
      // Extract directory path part and include it in the output filename
      const name = pathData.chunk.name;
      // Ensure the output path is relative to `dist/js` and uses forward slashes
      const outputPath = name.startsWith("../") ? name.slice(3) : name;
      return `${outputPath}.js`;
    },
  },
  optimization: {
    splitChunks: {
      name: "vendor",
      chunks(chunk) {
        return chunk.name !== "background";
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        include: path.resolve(__dirname, "src"),
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: ".", to: "../", context: "public" }],
      options: {},
    }),
  ],
};
