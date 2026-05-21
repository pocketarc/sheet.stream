import security from "eslint-plugin-security";
import tseslint from "typescript-eslint";

export default tseslint.config(
    { ignores: ["**/node_modules/**", "**/.next/**", "**/out/**", "**/dist/**", "**/.wrangler/**"] },
    ...tseslint.configs.strictTypeChecked,
    security.configs.recommended,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            "@typescript-eslint/strict-boolean-expressions": [
                "error",
                {
                    allowString: true,
                    allowNumber: true,
                    allowNullableObject: false,
                    allowNullableBoolean: false,
                    allowNullableString: false,
                    allowNullableNumber: false,
                    allowAny: false,
                },
            ],
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unnecessary-condition": "off",
            "@typescript-eslint/no-floating-promises": "off",
            "@typescript-eslint/no-misused-promises": "off",
            "@typescript-eslint/await-thenable": "off",
            "@typescript-eslint/no-for-in-array": "off",
        },
    },
    {
        files: ["**/*.config.{ts,mjs,js}", "**/knexfile.ts"],
        languageOptions: {
            parserOptions: {
                projectService: false,
            },
        },
        ...tseslint.configs.disableTypeChecked,
    },
);
