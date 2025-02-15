import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import commonEslintConfig from '@qlippy/common/eslint.config.mjs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...commonEslintConfig,
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
