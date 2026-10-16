export interface Rng {
    next(): number;
    int(min: number, max: number): number;
}

export function createRng(seed: number): Rng {
    let state = seed >>> 0;

    const next = (): number => {
        state = (state + 0x6D2B79F5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    return {
        next,
        int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    }

}