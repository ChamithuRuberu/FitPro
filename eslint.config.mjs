import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'off', // Disable the rule globally
      "react/no-unescaped-entities": "off", // Disables the unescaped entities rule
      "no-console": "off",
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      '@typescript-eslint/explicit-module-boundary-types': 'off', // Disables explicit return type rule
      "@typescript-eslint/no-explicit-any": "off", // Disables warning for "any"
      "@next/next/no-img-element": "off", 
    },
  },
];

export default eslintConfig;
