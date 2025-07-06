import { TInfoConflict } from '../types/types';
import Table from 'cli-table3';
import chalk from 'chalk';

export const printConflictsTable = (
  title: string,
  color: (text: string) => string,
  conflicts: TInfoConflict[]
): void => {
  console.log(color(title));

  const table = new Table({
    head: ['Peer', 'Expected', 'Actual'],
    colAligns: ['left', 'center', 'center'],
  });

  conflicts.forEach(({ peerName, requiredRange, actualVersion }) => {
    table.push([
      chalk.yellow(peerName),
      chalk.gray(requiredRange),
      chalk.green(actualVersion),
    ]);
  });
  console.log(table.toString());
};
