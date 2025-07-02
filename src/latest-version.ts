import { TVersion } from './types/types.js';
function getUnscopedPackageName(pkgName: string): string | string[] {
  const parts = pkgName.split('@');

  return parts.length === 2 ? parts : pkgName;
}

export default async function getLatestVersion(
  url: string
): Promise<string | null> {
  try {
    //console.log('fsfsf', url);
    const response = await fetch(url);
    const latestVersion: TVersion[] = await response.json();

    if (latestVersion.length > 0) {
      return latestVersion[0].name;
    }

    return null;
  } catch (err) {
    console.warn('Ошибка при получении тегов:', err);
    return null;
  }
}
