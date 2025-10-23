import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  testEnvironment: 'node',
  moduleNameMapper: { '^src/(.*)$': '<rootDir>/src/$1' },
  coverageReporters: ['text', 'html', 'lcov'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'main.ts',
    'app.module.ts'
  ],
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 },
  },
};

export default config;
