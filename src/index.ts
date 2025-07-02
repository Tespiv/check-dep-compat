#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import semver from 'semver';
import searchAlternatives from './search-alternatives.js';
import searchRepo from './search-repo.js';

type PackageJson = {
  dependencies?: Record<string, string>;
};

function getUnscopedPackageName(pkgName: string): string {
  const parts = pkgName.split('/');
  return parts.length === 2 ? parts[1] : pkgName;
}

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

let hasConflicts = false;

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
          console.log(
            chalk.red(
              `❌ MAJOR conflict: "${pkgName}" requires "${peerName}@${requiredRange}", and you have "${actualVersion}"`
            )
          );
          const latestVersion = await searchRepo(pkgName);
          // console.log('latestVersion', latestVersion?.version?.split('.')[0]);
          // console.log('requiredRange', minActual.major);
          if (
            `${minActual.major}` === `${latestVersion?.version?.split('.')[0]}`
          ) {
            //console.log('ffff', requiredRange, actualVersion);
            console.log(
              `ты можешь обновиться до ${latestVersion?.version} ${pkgName}`
            );
          } else {
            const resultSearch = await searchAlternatives(pkgName);
            if (resultSearch.length > 0) {
              console.log(chalk.cyan('🔎 Возможные альтернативы:'));
              resultSearch.forEach((s) => {
                if (s.version) {
                  console.log(`📦 ${s.name}@${s.version} — ${s.description}`);
                  console.log(`👉 ${s.npm}`);
                } else {
                  console.log('Without info about latest version');
                }
              });
            }
          }

          hasConflicts = true;
        } else {
          console.log(
            chalk.yellow(
              `⚠️ Possible incompatibility: "${pkgName}" expects "${peerName}@${requiredRange}", you have "${actualVersion}"`
            )
          );
          hasConflicts = true;
        }
      }
    }
  }

  if (!hasConflicts) {
    console.log(chalk.green('✅ No conflicts found.'));
  }
})();
