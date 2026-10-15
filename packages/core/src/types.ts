export type UnitClass = 'knight' | 'archer' | 'mage' | 'healer' | 'assassin';
export type Slot = 'weapon' | 'armor' | 'keepsake';
export type Side = 'A' | 'B';

export interface stats {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
}

export interface UnitTemplate {
    class: UnitClass;
    name: string;
    stats: stats;
    weightCapacity: number;
}

export interface Item {
    id: string;
    name: string;
    slot: Slot;
    weight: number;
    bonus: Partial<stats>;
}

export interface Loadout {
    unit: UnitClass;
    itemIds: string[];
}

export interface ValidationResult {
    valid: boolean;
    errors: string[];
    totalWeight: number;
}