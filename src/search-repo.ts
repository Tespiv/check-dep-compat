import { TPackageSuggestionVersion, TRegistryDTO } from './types/types';

export default async function searchRepo(
  repo: string
): Promise<TPackageSuggestionVersion | null> {
  const url = `https://registry.npmjs.org/${repo}`;

  try {
    const response = await fetch(url);
    if (!response) {
      return null;
    }
    const result: TRegistryDTO = await response.json();

    const latestVersion = result['dist-tags'].latest;
    return {
      version: latestVersion,
    };
  } catch (err) {
    console.error('❌ Failed to fetch repo:', err);
    throw err;
  }
}
