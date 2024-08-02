import {describe, expect, it} from 'vitest';
import {
  createPrTitle, failMergeResult,
  getGitFlowType,
  getTaskNumbers, getTitleDescription,
  isPullRequestTitleWithoutTaskNumbers,
  isPullRequestTitleWithTaskNumbers, mergeTitle, successMergeResult
} from '.github/workflows/revert-and-merge-feature-branch/utils/pull-request-title-utils';

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

  describe("createTitle", () => {
    const testCases = [
      {
        flowType: "feat",
        taskNumbers: ["FL-1234", "FL-1235"],
        description: "text",
        expected: "feat(FL-1234, FL-1235): text",
      },
      {
        flowType: "feat",
        taskNumbers: ["FL-1234"],
        description: "text",
        expected: "feat(FL-1234): text",
      },
      {
        flowType: "feat",
        taskNumbers: [],
        description: "text",
        expected: "feat: text",
      },
    ];

    testCases.forEach(({flowType, taskNumbers, description, expected}) => {
      it(`should return ${expected} for "${flowType}", "${taskNumbers}" and "${description}"`, () => {
        expect(createPrTitle(flowType, taskNumbers, description)).toEqual(expected);
      });
    });
  })

  describe("mergeTitle", () => {
    const testCases = [
      {
        baseTitle: "feat: text",
        newTitle: "feat: new text",
        expected: successMergeResult("feat: text"),
      },
      {
        baseTitle: "feat(FL-1234): text",
        newTitle: "feat(FL-1234): new text",
        expected: successMergeResult("feat(FL-1234): text"),
      },
      {
        baseTitle: "feat(FL-1234, FL-1222): text",
        newTitle: "feat(FL-1244): new text",
        expected: successMergeResult("feat(FL-1234, FL-1222, FL-1244): text"),
      },
      {
        baseTitle: "feat(FL-1234): text",
        newTitle: "feat: new text",
        expected: successMergeResult("feat(FL-1234): text"),
      },
      {
        baseTitle: "feat: text",
        newTitle: "feat(FL-1234): new text",
        expected: successMergeResult("feat(FL-1234): text"),
      },
      {
        baseTitle: "feat(chore): text",
        newTitle: "feat: new text",
        expected: failMergeResult(`Base title "feat(chore): text" is not valid`),
      },
      {
        baseTitle: "feat: text",
        newTitle: "feat(chore): new text",
        expected: failMergeResult(`New title "feat(chore): new text" is not valid`),
      }
    ]

    testCases.forEach(({baseTitle, newTitle, expected}) => {
      it(`mainTitle: "${baseTitle}" and newTitle: "${newTitle}"`, () => {
        expect(mergeTitle(baseTitle, newTitle)).toEqual(expected);
      });
    });
  })
})
