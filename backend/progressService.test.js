// tests/progressService.test.js

const { calculateStreak } = require("../src/services/progressService")

describe("Progress Service — streak calculation", () => {
    /**
     * BEFORE FIX (timezone bug reproduction)
     * Users in positive UTC offsets could lose streak incorrectly
     */
    describe("BEFORE FIX (BUGGY BEHAVIOUR)", () => {
        test("fails when user activity crosses local timezone boundary", () => {
            const userActivity = [
                // Simulated local-date-based entries (buggy assumption)
                new Date("2026-05-09T23:30:00+02:00"),
                new Date("2026-05-10T00:10:00+02:00"),
            ]

            const streak = calculateStreak(userActivity, { useUTC: false })

            // ❌ This would FAIL before fix (streak incorrectly reset)
            expect(streak).toBe(2)
        })
    })

    /**
     * AFTER FIX (UTC-normalised logic)
     */
    describe("AFTER FIX (UTC NORMALISATION)", () => {
        test("correctly maintains streak across timezone boundaries", () => {
            const userActivity = [
                new Date("2026-05-09T23:30:00+02:00"),
                new Date("2026-05-10T00:10:00+02:00"),
            ]

            const streak = calculateStreak(userActivity, { useUTC: true })

            // ✅ Now passes after UTC normalization fix
            expect(streak).toBe(2)
        })

        test("resets streak only when UTC day gap exists", () => {
            const userActivity = [
                new Date("2026-05-08T10:00:00Z"),
                new Date("2026-05-10T10:00:00Z"), // 1-day gap
            ]

            const streak = calculateStreak(userActivity, { useUTC: true })

            expect(streak).toBe(1)
        })
    })
})
