// export type ActionResult<T = undefined> =
//   | { success: true; data: T }
//   | { success: false; message: string; fieldErrors?: Record<string, string[]> };

// export function createActionResult<T = undefined>(
//   success: boolean,
//   messageOrData: string | T,
//   fieldErrors?: Record<string, string[]>
// ): ActionResult<T> {
//   if (success) {
//     return {
//       success: true,
//       data: messageOrData as T,
//     };
//   }

//   return {
//     success: false,
//     message: typeof messageOrData === "string" ? messageOrData : "An error occurred",
//     fieldErrors,
//   };
// }

export type ActionResult<T = undefined> =
  | { success: true; data?: T; message?: string }
  | { success: false; message: string; fieldErrors?: Record<string, string[]> };

export function actionSuccess<T = undefined>(
  data?: T,
  message?: string
): ActionResult<T> {
  return { success: true, data, message };
}

export function actionError<T = undefined>(
  message: string,
  fieldErrors?: Record<string, string[]>
): ActionResult<T> {
  return { success: false, message, fieldErrors };
}