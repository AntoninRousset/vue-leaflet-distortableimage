import commonjs from "rollup-plugin-commonjs";
import VuePlugin from "rollup-plugin-vue";

export default {
  input: "./src/lib.js",
  output: [
    {
      file: "dist/vue-leaflet-distortableimage.esm.js",
      format: "es",
      sourcemap: true,
    },
    {
      file: "dist/vue-leaflet-distortableimage.cjs.js",
      format: "cjs",
      sourcemap: true,
    },
    {
      file: "dist/vue-leaflet-distortableimage.umd.js",
      format: "umd",
      name: "vue-leaflet",
      sourcemap: true,
      globals: {
        leaflet: "L",
        vue: "vue",
      },
    },
  ],
  plugins: [
    commonjs(),
    VuePlugin({
      css: false,
    }),
  ],
  external: ["vue", "leaflet/dist/leaflet-src.esm", "leaflet", "vue-leaflet"],
};
