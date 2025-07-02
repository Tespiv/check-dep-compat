import { COUNT_SEARCH_REP } from './constants/constants.js';
import getLatestVersion from './latest-version.js';
import searchRepo from './search-repo.js';
import {
  TPackageSuggestion,
  TResultsSearch,
  TPackageSuggestionDTO,
  TItem,
  TFilterObjects,
} from './types/types.js';

export default async function searchAlternatives(
  pkgName: string
): Promise<TPackageSuggestion[]> {
  //const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(pkgName)}&per_page=${COUNT_SEARCH_REP}`;
  const url = `https://registry.npmjs.org/-/v1/search?text=${pkgName}&size=${COUNT_SEARCH_REP}`;
  console.log('url', url);
  //const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(pkgName)}&per_page=5`;
  try {
    const response = await fetch(url);
    const res: TFilterObjects = await response.json();
    //console.log('dvdfasfadfasdasd', res.items[0]);

    const result = await Promise.all(
      res.objects.map(async (r: TItem) => {
        const latestVersion = await searchRepo(r.package.name);
        // console.log('bib', r.package.name);
        // console.log(
        //   'latestVersionlatestVersionlatestVersionlatestVersion',
        //   latestVersion
        // );
        return {
          name: r.package.name,
          version: latestVersion?.version ?? null,
          description: r.package.description,
          npm: r.package.links.npm,
        };
      })
    );
    return result;
  } catch (err) {
    console.warn('⚠️ Ошибка при поиске альтернатив:', err);
    return [];
  }
}
