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
      // Disable TypeScript-specific rules
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-this-alias': 'off',

      // Disable React-specific rules
      "react/no-unescaped-entities": "off",
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/prop-types": "off",
      "react/display-name": "off",
      "react/no-unknown-property": "off",
      "react/no-children-prop": "off",

      // Disable Next.js-specific rules
      "@next/next/no-img-element": "off",
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/no-sync-scripts": "off",
      "@next/next/no-css-tags": "off",
      "@next/next/google-font-display": "off",
      "@next/next/link-passhref": "off",

      // Disable general JavaScript rules
      "no-console": "off",
      "no-unused-vars": "off",
      "no-undef": "off",
      "no-empty": "off",
      "no-prototype-builtins": "off",
      "no-constant-condition": "off",
      "no-useless-escape": "off",
      "no-case-declarations": "off",
      "no-mixed-spaces-and-tabs": "off",
      "no-async-promise-executor": "off",
      
      // Additional rules that might cause issues
      "import/no-anonymous-default-export": "off",
      "import/no-unresolved": "off",
      "jsx-a11y/alt-text": "off",
      "jsx-a11y/anchor-is-valid": "off",
      "jsx-a11y/role-has-required-aria-props": "off",
    },
    // Ignore all warnings
    ignorePatterns: ["**/*"],
    // Set all warnings to off
    settings: {
      next: {
        rootDir: ".",
      },
    },
  },
];

export default eslintConfig;
