import getLatestVersion from './latest-version.js';
import {
  TPackageSuggestionDTO,
  TPackageSuggestionVersion,
  TRegistryDTO,
} from './types/types';

export default async function searchRepo(
  repo: string
): Promise<TPackageSuggestionVersion | null> {
  const url = `https://registry.npmjs.org/${repo}`;

  try {
    const response = await fetch(url);
    if (!response) {
      return null;
    }
    //console.log('dwdwdwdwdwdw22222', url);
    const r: TRegistryDTO = await response.json();
    //console.log('dwdwdwdwdwdw22222', r);

    const latestVersion = r['dist-tags'].latest;
    return {
      version: latestVersion,
    };
  } catch (err) {
    console.error('❌ Failed to fetch repo:', err);
    throw err;
  }
}
