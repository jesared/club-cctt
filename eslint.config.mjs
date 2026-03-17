import nextVitals from "eslint-config-next/core-web-vitals.js";
import nextTs from "eslint-config-next/typescript.js";

const asConfigArray = (config) => (Array.isArray(config) ? config : [config]);

const eslintConfig = [
  ...asConfigArray(nextVitals),
  ...asConfigArray(nextTs),
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
