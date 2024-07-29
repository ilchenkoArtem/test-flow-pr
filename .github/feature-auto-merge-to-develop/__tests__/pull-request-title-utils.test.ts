import {describe, expect, it} from 'vitest';
import {
  getGitFlowType,
  getTaskNumbers, getTitleDescription,
  isPullRequestTitleWithoutTaskNumbers,
  isPullRequestTitleWithTaskNumbers
} from '../pull-request-title-utils';

describe('pull-request-title-utils', () => {
  describe('isPullRequestTitleWithoutScope', () => {
    const testCases = [
      {
        input: 'feat: text',
        expected: true,
      },
      {
        input: 'feat:text',
        expected: true,
      },
      {
        input: 'feat(text): text',
        expected: false,
      },
      {
        input: "customScope: text",
        expected: false,
      }
    ];

    testCases.forEach(({input, expected}) => {
      it(`should return "${expected}" for "${input}"`, () => {
        expect(isPullRequestTitleWithoutTaskNumbers(input)).toEqual(expected);
      });
    });
  })

  describe('isPullRequestTitleWithScope', () => {
    const validTestCases: string[] = [
      'feat(FL-1234): text',
      'feat(FL-1234):text',
      'feat(FL-1234, FL-23444): test',
      'feat(FL-1234,FL-23444):test',
    ];

    const invalidTestCases: string[] = [
      'feat: text',
      'feat:text',
      'feat(text): text',
      "customScope: text",
      "feat(Fl-1234): text",
      "(FL-1234): text",
    ];

    const testCases = [
      ...validTestCases.map((input) => ({input, expected: true})),
      ...invalidTestCases.map((input) => ({input, expected: false})),
    ];

    testCases.forEach(({input, expected}) => {
      it(`should return "${expected}" for "${input}"`, () => {
        expect(isPullRequestTitleWithTaskNumbers(input)).toEqual(expected);
      });
    });
  })


  describe("getTaskNumbers", () => {
    const testCases = [
      {
        input: "feat(FL-1111, fl-2222, Fl-3333): text",
        expected: ["FL-1111", "FL-2222", 'FL-3333'],
      },
      {
        input: "feat(FL-1111,fl-2222,Fl-3333): text",
        expected: ["FL-1111", "FL-2222", 'FL-3333'],
      },
      {
        input: "feat(FL-1111): text:text",
        expected: ["FL-1111"],
      },
      {
        input: "feat():text",
        expected: [],
      },
      {
        input: "feat: text",
        expected: [],
      }
    ];

    testCases.forEach(({input, expected}) => {
      it(`should return ${expected} for "${input}"`, () => {
        expect(getTaskNumbers(input)).toEqual(expected);
      });
    });
  })

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
      {
        input: "feat(FL-1234):text",
        expected: "feat",
      },
      {
        input: "feat: text",
        expected: "feat",
      },
      {
        input: "feat:text:text",
        expected: "feat",
      },
    ];

    testCases.forEach(({input, expected}) => {
      it(`should return ${expected} for "${input}"`, () => {
        expect(getGitFlowType(input)).toEqual(expected);
      });
    });
  })

  describe("getTitleDescription", () => {
    const testCases = [
      {
        input: "feat(FL-1234): text",
        expected: "text",
      },
      {
        input: "feat(FL-1234): text:text",
        expected: "text:text",
      },
      {
        input: "feat(FL-1234):text",
        expected: "text",
      },
      {
        input: "feat: text",
        expected: "text",
      },
      {
        input: "feat:text:text",
        expected: "text:text",
      },
    ];

    testCases.forEach(({input, expected}) => {
      it(`should return ${expected} for "${input}"`, () => {
        expect(getTitleDescription(input)).toEqual(expected);
      });
    });
  })
})
