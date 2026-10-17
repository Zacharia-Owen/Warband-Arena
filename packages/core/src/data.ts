import type { Item, UnitClass, UnitTemplate } from './types';

export const UNITS: Record<UnitClass, UnitTemplate> ={
    knight: { class: 'knight', name: 'Knight', base: {hp: 120, attack: 20, defense: 15, speed: 3}, weightCapacity: 20},
    archer: { class: 'archer', name: 'Archer', base: {hp: 80, attack: 25, defense: 10, speed: 5}, weightCapacity: 12},
    mage: { class: 'mage', name: 'Mage', base: {hp: 60, attack: 30, defense: 5, speed: 4}, weightCapacity: 10},
    healer: { class: 'healer', name: 'Healer', base: {hp: 100, attack: 15, defense: 20, speed: 2}, weightCapacity: 15},
    assassin: { class: 'assassin', name: 'Assassin', base: {hp: 70, attack: 35, defense: 8, speed: 6}, weightCapacity: 10},
}

export const ITEMS: Record<string, Item> = {
    'iron-sword': { id: 'iron-sword', name: 'Iron Sword', slot: 'weapon', weight: 5, bonus: { attack: 10 } },
    'war-axe': { id: 'war-axe', name: 'War Axe', slot: 'weapon', weight: 7, bonus: { attack: 15, speed: -2 } },
    'maple-staff': { id: 'maple-staff', name: 'Maple Staff', slot: 'weapon', weight: 4, bonus: { attack: 8 } },
    'iron-armor': { id: 'iron-armor', name: 'Iron Armor', slot: 'armor', weight: 10, bonus: { defense: 12 } },
    'leather-armor': { id: 'leather-armor', name: 'Leather Armor', slot: 'armor', weight: 6, bonus: { defense: 8 } },
    'healing-talisman': { id: 'healing-talisman', name: 'Healing Talisman', slot: 'keepsake', weight: 2, bonus: { hp: 20 } },
    'swiftness-boots': { id: 'swiftness-boots', name: 'Swiftness Boots', slot: 'keepsake', weight: 1, bonus: { speed: 2 } },
    'amulet-of-protection': { id: 'amulet-of-protection', name: 'Amulet of Protection', slot: 'keepsake', weight: 3, bonus: { hp: 20, defense: 5 } },
    'short-maple-bow': { id: 'short-maple-bow', name: 'Short Maple Bow', slot: 'weapon', weight: 3, bonus: { attack: 7 } },
    'long-maple-bow': { id: 'long-maple-bow', name: 'Long Maple Bow', slot: 'weapon', weight: 5, bonus: { attack: 14, speed: -1 } },
    'cloth-robe': { id: 'cloth-robe', name: 'Cloth Robe', slot: 'armor', weight: 2, bonus: { defense: 3 } },
    'iron-dagger': { id: 'iron-dagger', name: 'Iron Dagger', slot: 'weapon', weight: 2, bonus: { attack: 5 } },
    'iron-shield': { id: 'iron-shield', name: 'Iron Shield', slot: 'keepsake', weight: 5, bonus: { defense: 10 } },
}