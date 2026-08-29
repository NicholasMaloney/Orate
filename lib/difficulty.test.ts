/** Small test case to confirm Vitest can find files @ alias works, etc. */

import {
    describe,
    expect,
    it,
} from "vitest";

import { DIFFICULTY_DETAILS , DIFFICULTY_ORDER, } from "@/lib/difficulty";

describe("difficulty settings", () => {
    it("orders the options from easiest to most challenging", () => {
        expect(DIFFICULTY_ORDER).toEqual([
            "easy",
            "standard",
            "challenging",
        ]);
    });

    it("reduces the available attempts as difficulty increases", () => {
        const attempts = DIFFICULTY_ORDER.map(
            (difficulty) => 
                DIFFICULTY_DETAILS[difficulty].attempts,
        );

        expect(attempts).toEqual([8, 6, 4]); 

    });
});