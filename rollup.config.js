import dts from "rollup-plugin-dts";
import typescript from "@rollup/plugin-typescript";

export default [
  [
    typescript({
      include: ["src/**/*"],
      compilerOptions: { removeComments: true },
    }),
  ],
  [dts()],
].map((plugins) => ({
  input: "src/index.ts",
  output: [{ dir: "dist", format: "esm" }],
  external: ["react", "react/jsx-runtime", "react-dom"],
  plugins,
}));
