import dts from "rollup-plugin-dts";
import typescript from "@rollup/plugin-typescript";

const config = {
  input: "src/index.ts",
  output: [{ dir: "dist", format: "esm" }],
  external: ["react", "react/jsx-runtime", "react-dom"],
};

export default [
  {
    ...config,
    plugins: [
      typescript({
        include: ["src/**/*"],
        compilerOptions: { removeComments: true },
      }),
    ],
  },
  {
    ...config,
    plugins: [dts()],
  },
];
