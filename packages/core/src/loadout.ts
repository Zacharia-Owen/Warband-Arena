import {ITEMS, UNITS} from './data'
import type { Loadout, Slot, Stats, ValidationResult } from './types'

export function validateLoadout(loadout: Loadout): ValidationResult {
    const errors: string[] = [];

    if (!Object.hasOwn(UNITS, loadout.unit)) {
        return { valid: false, errors: [`Unknown unit class: ${loadout.unit}`], totalWeight: 0 };
    }
    const unit = UNITS[loadout.unit];

    const filledSlots = new Set<Slot>();
    let totalWeight = 0;

    for (const id of loadout.itemIds) {
        if (!Object.hasOwn(ITEMS, id)) {
            errors.push(`Unknown item: ${id}`);
            continue;
        }
        const item = ITEMS[id]!;

        if (filledSlots.has(item.slot)) {
            errors.push(`Slot already filled: ${item.slot}`);
        }
        filledSlots.add(item.slot);
        totalWeight += item.weight;
    }

    if (totalWeight > unit.weightCapacity) {
        errors.push(`Too heavy: ${totalWeight} > ${unit.weightCapacity}`);
    }

    return { valid: errors.length === 0, errors, totalWeight };
}

export function computeStats(loadout: Loadout): Stats {
    const check = validateLoadout(loadout);
    if (!check.valid) {
        throw new Error(`Invalid loadout: ${check.errors.join(', ')}`);
    }

    const stats: Stats = {...UNITS[loadout.unit].base};
    for (const id of loadout.itemIds) {
        const { bonus } = ITEMS[id]!;
        stats.hp += bonus.hp ?? 0;
        stats.attack += bonus.attack ?? 0;
        stats.defense += bonus.defense ?? 0;
        stats.speed += bonus.speed ?? 0;
    }

    stats.hp = Math.max(1, stats.hp);
    stats.attack = Math.max(0, stats.attack);
    stats.defense = Math.max(0, stats.defense);
    stats.speed = Math.max(0, stats.speed);
    return stats;
}