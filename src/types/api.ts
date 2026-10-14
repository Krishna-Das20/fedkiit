import type { AxiosError } from "axios";

/**
 * What a failed `api` call rejects with. The route handlers put the reason in
 * `message` (and `success: false`), which the UI shows to the user.
 */
export type ApiError = AxiosError<{
  message?: string;
  success?: boolean;
  /** Machine-readable details, e.g. `[{ code: "ALREADY_MARKED" }]`. */
  errors?: { code?: string; message?: string }[];
  [key: string]: unknown;
}>;
