export function useConstructUrl(key: string): string {
  if (key.startsWith("http")) {
    return key;
  }

  return `https://utfs.io/f/${key}`;
}
