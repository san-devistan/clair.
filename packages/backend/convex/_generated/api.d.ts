/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accountingAccess from "../accountingAccess.js";
import type * as accountingSources from "../accountingSources.js";
import type * as auth from "../auth.js";
import type * as authOnboarding from "../authOnboarding.js";
import type * as billing from "../billing.js";
import type * as billingActions from "../billingActions.js";
import type * as billingLib from "../billingLib.js";
import type * as billingPlans from "../billingPlans.js";
import type * as http from "../http.js";
import type * as sageActiveActions from "../sageActiveActions.js";
import type * as sageActiveConfig from "../sageActiveConfig.js";
import type * as sageActiveStore from "../sageActiveStore.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accountingAccess: typeof accountingAccess;
  accountingSources: typeof accountingSources;
  auth: typeof auth;
  authOnboarding: typeof authOnboarding;
  billing: typeof billing;
  billingActions: typeof billingActions;
  billingLib: typeof billingLib;
  billingPlans: typeof billingPlans;
  http: typeof http;
  sageActiveActions: typeof sageActiveActions;
  sageActiveConfig: typeof sageActiveConfig;
  sageActiveStore: typeof sageActiveStore;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("../betterAuth/_generated/component.js").ComponentApi<"betterAuth">;
  stripe: import("@convex-dev/stripe/_generated/component.js").ComponentApi<"stripe">;
};
