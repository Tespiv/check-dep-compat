import { COUNT_SEARCH_REP } from './constants/constants.js';
import searchRepo from './search-repo.js';
import { TPackageSuggestion, TItem, TFilterObjects } from './types/types.js';

export default async function searchAlternatives(
  pkgName: string
): Promise<TPackageSuggestion[]> {
  const url = `https://registry.npmjs.org/-/v1/search?text=${pkgName}&size=${COUNT_SEARCH_REP}`;
  try {
    const response = await fetch(url);
    const res: TFilterObjects = await response.json();

    const result = await Promise.all(
      res.objects.map(async (result: TItem) => {
        const latestVersion = await searchRepo(result.package.name);

        return {
          name: result.package.name,
          version: latestVersion?.version ?? null,
          description: result.package.description,
          npm: result.package.links.npm,
        };
      })
    );
    return result;
  } catch (err) {
    console.warn('⚠️ Error while searching for alternatives:', err);
    return [];
  }
}
