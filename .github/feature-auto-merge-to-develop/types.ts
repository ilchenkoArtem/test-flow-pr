import type {
  RestEndpointMethodTypes
} from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';

export type PullRequest = RestEndpointMethodTypes["pulls"]["get"]["response"]['data']
