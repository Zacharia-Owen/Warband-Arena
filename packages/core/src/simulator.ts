import { computeStats, validateLoadout } from './loadout';
import { createRng, type Rng } from './rng';
import type { Loadout, Side, Stats, UnitClass } from './types';

export const MAX_ROUNDS = 25;
export const MAX_TEAM_SIZE = 4;

export class InvalidBattleError extends Error {
    constructor(public readonly problems: string[]) {
        super(`Invalid battle: ${problems.join('; ')}`);
        this.name = 'InvalidBattleError';
    }
}

interface Combatant {
    id: string;
    side: Side;
    unit: UnitClass;
    maxHp: number;
    hp: number;
    stats: Stats;
}

export type LogEvent = 
    | { round: number; type: 'attack'; actor: string; target: string; damage: number; crit: boolean; targetHp: number; defeated: boolean }
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

    const rng = createRng(seed);
    const combatants = [...buildTeam('A', teamA), ...buildTeam('B', teamB)];
    const log: LogEvent[] = [];

    let round = 0;
    while (round < MAX_ROUNDS && !isOver(combatants)) {
        round++;
        const order = combatants
        .filter(c => c.hp > 0)
        .sort((x, y) => y.stats.speed - x.stats.speed || x.id.localeCompare(y.id));

        for (const actor of order) {
            if (actor.hp <=0) continue;
            if (isOver(combatants)) break;
            takeTurn(actor, combatants, rng, round, log);
        }
    }
    return {
        seed,
        winner: decideWinner(combatants),
        rounds: round,
        log,
        survivors: combatants.filter((c) => c.hp > 0).map(({ id, hp}) => ({id, hp})) ,
    };
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

function buildTeam(side: Side, team: Loadout[]): Combatant[] {
    return team.map((loadout, i) => {
        const stats = computeStats(loadout);
        return { id: `${side}${i + 1}-${loadout.unit}`, side, unit: loadout.unit, maxHp: stats.hp, hp: stats.hp, stats };
    });
}

function alive(all: Combatant[], side: Side): Combatant[] {
    return all.filter((c) => c.side === side && c.hp > 0);
}

function isOver(all: Combatant[]): boolean {
    return alive(all, 'A').length === 0 || alive(all, 'B').length === 0;
}

function takeTurn(actor: Combatant, all: Combatant[], rng: Rng, round: number, log: LogEvent[]): void {
    if (actor.unit === 'healer') {
        const hurt = alive(all, actor.side)
        .filter((c) => c.hp < c.maxHp * 0.5)
        .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp || a.id.localeCompare(b.id));
        const patient = hurt[0];
        if (patient) {
            const amount = Math.min(10 + rng.int(0, 5), patient.maxHp - patient.hp);
            patient.hp += amount;
            log.push({ round, type: 'heal', actor: actor.id, target: patient.id, amount, targetHp: patient.hp });
            return;
        }
    }

    const enemies = alive(all, actor.side === 'A' ? 'B' : 'A');
    const target = enemies[rng.int(0, enemies.length - 1)]!;

    const mitigation = actor.unit === 'mage' ? Math.floor(target.stats.defense / 2) : target.stats.defense;
    const base = Math.max(0, actor.stats.attack - mitigation);
    const variance = rng.int (0, 3);
    const crit = actor.unit === 'assassin' && rng.int(1, 100) < 25;
    const damage = (base + variance) * (crit ? 2 : 1);

    target.hp = Math.max(0, target.hp - damage);
    log.push({ round, type: 'attack', actor: actor.id, target: target.id, damage, crit, targetHp: target.hp, defeated: target.hp === 0 });
}

function decideWinner(all: Combatant[]): Side | 'draw' {
    const a = alive(all, 'A');
    const b = alive(all, 'B');
    if (a.length > 0 && b.length === 0) return 'A';
    if (b.length > 0 && a.length === 0) return 'B';
    const aHp = a.reduce((sum, c) => sum + c.hp, 0);
    const bHp = b.reduce((sum, c) => sum + c.hp, 0);
    return aHp === bHp ? 'draw' : aHp > bHp ? 'A' : 'B';
}