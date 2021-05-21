
const { pathsToModuleNameMapper } = require("ts-jest/utils");
const { compilerOptions } = require("./tsconfig.json");

/** @type {import("ts-jest/dist/types").InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',

    // The glob patterns Jest uses to detect test files
    testMatch: [
        "**/__tests__/*.test.+(ts|tsx|js)"
    ],

    moduleNameMapper: pathsToModuleNameMapper(
        compilerOptions.paths, {
            prefix: "<rootDir>/"
        }
    ),
};
