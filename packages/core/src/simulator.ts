import { validateLoadout } from './loadout';
import type { Loadout, Side } from './types';

export const MAX_ROUNDS = 25;
export const MAX_TEAM_SIZE = 4;

export class InvalidBattleError extends Error {
    constructor(public readonly problems: string[]) {
        super(`Invalid battle: ${problems.join('; ')}`);
        this.name = 'InvalidBattleError';
    }
}

export type LogEvent = 
    | { round: number; type: 'attack'; actor: string; target: string; damage: number; critical: boolean; targetHp: number; defeated: boolean }
    | { round: number; type: 'heal'; actor: string; target: string; amount: number; targetHp: number };

export interface BattleResult {
    seed: number;
    winner: Side | 'draw';
    rounds: number;
    log: LogEvent[];
    survivors: { id: string; hp: number }[];
}

export function simulate(teamA: Loadout[], teamB: Loadout[], seed: number): BattleResult {
    const problems = [...checkTeam('A', teamA), ...checkTeam('B', teamB)];
    if (problems.length > 0) throw new InvalidBattleError(problems);

    throw new Error('Not implemented yet');
}

function checkTeam(label: string, team: Loadout[]): string[] {
    const problems: string[] = [];
    if (team.length < 1 || team.length > MAX_TEAM_SIZE) {
        problems.push(`Team ${label} must have 1-${MAX_TEAM_SIZE} units`);
    }
    team.forEach((Loadout, i) => {
        const check = validateLoadout(Loadout);
        check.errors.forEach((e) => problems.push(`Team ${label} unit ${i + 1}: ${e}`));
    })
    return problems;
}