import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

export default [
  [
    typescript({
      noEmitOnError: true,
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
