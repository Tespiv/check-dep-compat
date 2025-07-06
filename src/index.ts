#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import semver from 'semver';
import searchAlternatives from './search-alternatives.js';
import searchRepo from './search-repo.js';
import { TInfoConflict } from './types/types.js';
import { printConflictsTable } from './utils/print-conflicts-table.js';
import Table from 'cli-table3';
type PackageJson = {
  dependencies?: Record<string, string>;
};

const ROOT = process.cwd();
const rootPkgPath = path.join(ROOT, 'package.json');
const nodeModulesPath = path.join(ROOT, 'node_modules');

if (!fs.existsSync(rootPkgPath)) {
  console.error(chalk.red('❌ Package.json not found in the current folder'));
  process.exit(1);
}

const rootPkg: PackageJson = JSON.parse(fs.readFileSync(rootPkgPath, 'utf-8'));
const rootDeps = rootPkg.dependencies || {};

console.log(chalk.blue('🔍 Checking the peerDependencies of all packets...'));

let hasConflicts: boolean = false;
const handledPackages = new Set<string>();

(async () => {
  for (const [pkgName, rootVersion] of Object.entries(rootDeps)) {
    const pkgJsonPath = path.join(nodeModulesPath, pkgName, 'package.json');

    if (!fs.existsSync(pkgJsonPath)) {
      console.warn(
        chalk.yellow(`⚠️ Package ${pkgName} not found in node_modules`)
      );
      continue;
    }

    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
    const peerDeps: Record<string, string> = pkgJson.peerDependencies || {};

    const majorConflicts: TInfoConflict[] = [];

    const otherConflicts: TInfoConflict[] = [];

    for (const [peerName, requiredRange] of Object.entries(peerDeps)) {
      const actualVersion = rootDeps[peerName];
      if (!actualVersion) continue;

      const minActual = semver.minVersion(actualVersion);
      if (!minActual) continue;

      const isSatisfied = semver.satisfies(minActual, requiredRange);
      if (!isSatisfied) {
        const requiredVer = semver.minVersion(requiredRange);
        if (!requiredVer) continue;

        if (requiredVer.major !== minActual.major) {
          hasConflicts = true;

          const latestVersion = await searchRepo(pkgName);
          if (
            `${minActual.major}` === `${latestVersion?.version?.split('.')[0]}`
          ) {
            console.log(
              `You can upgrade to ${latestVersion?.version} ${pkgName}`
            );
          } else {
            majorConflicts.push({ peerName, requiredRange, actualVersion });
          }
        } else {
          otherConflicts.push({ peerName, requiredRange, actualVersion });

          hasConflicts = true;
        }
      }
    }

    if (majorConflicts.length > 0 || otherConflicts.length > 0) {
      console.log('');
      console.log(chalk.bold(`📦 ${pkgName}`));
    }

    if (majorConflicts.length > 0) {
      printConflictsTable('❌ MAJOR conflicts:', chalk.red, majorConflicts);

      if (!handledPackages.has(pkgName)) {
        const resultSearch = await searchAlternatives(pkgName);
        if (resultSearch.length > 0) {
          console.log(chalk.cyan('\n🔎 Possible alternatives:'));

          const table = new Table({
            colWidths: [100],
            wordWrap: true,
            style: { head: [], border: [] },
          });

          resultSearch.forEach((s) => {
            const versionStr = s.version ? `@${s.version}` : '';
            const block = [
              chalk.yellow(`📦 ${s.name}${versionStr}`),
              chalk.gray(`Description: ${s.description || 'No description'}`),
              chalk.green(`Link:    👉 ${s.npm}`),
            ].join('\n');

            table.push([block]);
          });

          console.log(table.toString());
        }
      }

      handledPackages.add(pkgName);
    }

    if (otherConflicts.length > 0) {
      printConflictsTable(
        '⚠️ Possible incompatibilities:',
        chalk.yellow,
        otherConflicts
      );
    }
  }

  if (!hasConflicts) {
    console.log(chalk.green('✅ No conflicts found.'));
  }
})();
