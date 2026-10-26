import { defineConfig } from "steiger";
import fsd from "@feature-sliced/steiger-plugin";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    files: ["./src/app/**"],
    rules: {
      "fsd/segments-by-purpose": "off",
    },
  },
  {
    rules: {
      "fsd/insignificant-slice": "warn",
    },
  },
]);
