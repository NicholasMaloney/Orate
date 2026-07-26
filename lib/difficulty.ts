import type { Difficulty } from "@/lib/types";

interface DifficultyDetails {
    readonly label: string;
    readonly attempts: number;
    readonly description: string;
}

// Defines what each difficulty value represents
// Record constructs a object where the Keys are a specified type 
    // Difficulty = string - easy, standard, challenging
    // DifficultyDetails = label, attempts, desc.. detailed below.
    // also allows me to add more difficulties later 
export const DIFFICULTY_DETAILS: Readonly< 
    Record<Difficulty,DifficultyDetails>
> = {
    easy: {
        label: "Easy",
        attempts: 8,
        description: "More attempts for learners who need additional support."
    },

    standard: {
        label: "standard",
        attempts: 6,
        description: "A balanced number of attempts for most learners."
    },

    challenging: {
        label: "challenging",
        attempts: 4,
        description: "Fewer attempts for a more challenging activity."
    }
};

// Controls the order that the difficulty settings are dispayed
export const DIFFICULTY_ORDER: readonly Difficulty[] = [
    "easy",
    "standard",
    "challenging",
];