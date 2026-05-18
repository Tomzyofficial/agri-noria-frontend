// Next.js provides a custom Jest preset which handles Babel configuration
const nextJest = require("next/jest");

// Create a function to override Jest configuration
const createJestConfig = nextJest({
   // Provide the path to your Next.js app to load next.config.js and .env files
   dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
   setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
   moduleNameMapper: {
      // Handle module aliases (like @/components or @/_lib)
      "^@/(.*)$": "<rootDir>/src/$1",
   },
   testEnvironment: "node",
   // If you are using ES Modules in node_modules, you might need this:
   transformIgnorePatterns: ["/node_modules/(?!my-esm-package-name|another-esm-package).+\\.js$"],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is essential for module resolution
module.exports = createJestConfig(customJestConfig);
