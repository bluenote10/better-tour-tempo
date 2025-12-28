/**
 * Helper for exhaustiveness checking in TypeScript.
 * Similar to Python's assert_never.
 *
 * Use this in the default case of a switch statement or the else branch
 * of an if-else chain to ensure all cases of a union type are handled.
 *
 * If a case is missed, TypeScript will report a compile error.
 */
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}
