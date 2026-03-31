export async function readJson<T>(request: Request): Promise<T> {
  return request.json();
}

export function getTrimmedString(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}