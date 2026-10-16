module.exports = {
    testEnvironment: "node",
    testMatch: ["**/tests/**/*.test.js"],
    setupFiles: ["<rootDir>/tests/setupEnv.js"],
    collectCoverageFrom: ["services/**/*.js", "utils/**/*.js", "middleware/**/*.js", "!**/node_modules/**"],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
    verbose: true,
    testTimeout: 10000,
}
