import {describe, expect, it} from 'vitest';
import {getGitFlowType, getTaskNumbers, replaceTaskNumbers} from '../utils';

describe('utils', () => {
  describe("getTaskNumbers", () => {
    const testCases = [
      {
        input: "(FL-1234, FL-1235, Fl-1234, fl-1235)",
        expected: ["FL-1234", "FL-1235", 'FL-1234', 'FL-1235'],
      },
      {
        input: "()",
        expected: [],
      },
      {
        input: "",
        expected: [],
      },
    ];

    testCases.forEach(({input, expected}) => {
      it(`should return ${expected} for "${input}"`, () => {
        expect(getTaskNumbers(input)).toEqual(expected);
      });
    });
  });
  describe("getGitFlowType", () => {
    const testCases = [
      {
        input: "feat(FL-1234): text",
        expected: "feat",
      },
      {
        input: "feat(FL-1234): text:text",
        expected: "feat",
      },
    ];

    testCases.forEach(({input, expected}) => {
      it(`should return ${expected} for "${input}"`, () => {
        expect(getGitFlowType(input)).toEqual(expected);
      });
    });
  })
})
