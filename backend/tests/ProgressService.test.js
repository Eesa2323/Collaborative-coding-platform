const ProgressService = require("../../services/ProgressService")

describe("ProgressService - calculateStreak", () => {
    it("should return 0 streak for empty submissions", () => {
        const result = ProgressService.calculateStreak([])

        expect(result).toEqual({
            currentStreak: 0,
            longestStreak: 0,
            lastSubmitDate: null,
        })
    })

    it("should return 0 streak for null submissions", () => {
        const result = ProgressService.calculateStreak(null)

        expect(result).toEqual({
            currentStreak: 0,
            longestStreak: 0,
            lastSubmitDate: null,
        })
    })

    it("should return streak of 1 for single submission", () => {
        const now = new Date()
        const submissions = [{ createdAt: now }]

        const result = ProgressService.calculateStreak(submissions)

        expect(result.currentStreak).toBe(1)
        expect(result.longestStreak).toBe(1)
        expect(result.lastSubmitDate).toEqual(now)
    })

    it("should maintain streak for consecutive UTC days", () => {
        const date1 = new Date("2024-01-03T10:00:00Z")
        const date2 = new Date("2024-01-02T15:30:00Z")
        const date3 = new Date("2024-01-01T08:00:00Z")

        const submissions = [{ createdAt: date1 }, { createdAt: date2 }, { createdAt: date3 }]

        const result = ProgressService.calculateStreak(submissions)

        expect(result.currentStreak).toBe(3)
        expect(result.longestStreak).toBe(3)
    })

    it("should detect timezone bug - UTC-normalized boundaries", () => {
        // Test for the timezone bug mentioned in requirements
        // Create dates that are on the same day in UTC but different days in different timezones

        const date1 = new Date("2024-01-02T00:00:00Z") // UTC midnight
        const date2 = new Date("2024-01-01T23:59:59Z") // Just before UTC midnight

        const submissions = [{ createdAt: date1 }, { createdAt: date2 }]

        const result = ProgressService.calculateStreak(submissions)

        // These should be on consecutive UTC days
        expect(result.currentStreak).toBe(2)
        expect(result.longestStreak).toBe(2)
    })

    it("should reset streak on gap in submissions", () => {
        const date1 = new Date("2024-01-05T10:00:00Z")
        const date2 = new Date("2024-01-04T10:00:00Z")
        const date3 = new Date("2024-01-01T10:00:00Z") // Gap of 3 days

        const submissions = [{ createdAt: date1 }, { createdAt: date2 }, { createdAt: date3 }]

        const result = ProgressService.calculateStreak(submissions)

        // Current streak should be 2 (most recent consecutive days)
        expect(result.currentStreak).toBe(2)
        // But longest streak is also 2
        expect(result.longestStreak).toBe(2)
    })

    it("should identify longest streak correctly", () => {
        // 3-day streak, then gap, then 2-day streak
        const date1 = new Date("2024-01-08T10:00:00Z")
        const date2 = new Date("2024-01-07T10:00:00Z")
        const date3 = new Date("2024-01-06T10:00:00Z")
        const date4 = new Date("2024-01-03T10:00:00Z")
        const date5 = new Date("2024-01-02T10:00:00Z")

        const submissions = [
            { createdAt: date1 },
            { createdAt: date2 },
            { createdAt: date3 },
            { createdAt: date4 },
            { createdAt: date5 },
        ]

        const result = ProgressService.calculateStreak(submissions)

        expect(result.currentStreak).toBe(3)
        expect(result.longestStreak).toBe(3)
    })

    it("should handle submissions with missing createdAt", () => {
        const date1 = new Date("2024-01-03T10:00:00Z")
        const submissions = [
            { createdAt: date1 },
            { noCreatedAt: true },
            { createdAt: new Date("2024-01-02T10:00:00Z") },
        ]

        const result = ProgressService.calculateStreak(submissions)

        // Should skip submission without createdAt
        expect(result.currentStreak).toBe(2)
    })

    it("should use UTC midnight for all date comparisons", () => {
        // Two submissions on the same calendar day in UTC should count as same day
        const date1 = new Date("2024-01-02T20:00:00Z")
        const date2 = new Date("2024-01-02T08:00:00Z")

        const submissions = [{ createdAt: date1 }, { createdAt: date2 }]

        const result = ProgressService.calculateStreak(submissions)

        // Same UTC calendar day = only 1 day streak
        expect(result.currentStreak).toBe(1)
    })

    it("should return last submit date from most recent submission", () => {
        const date1 = new Date("2024-01-05T10:00:00Z")
        const date2 = new Date("2024-01-03T10:00:00Z")

        const submissions = [{ createdAt: date1 }, { createdAt: date2 }]

        const result = ProgressService.calculateStreak(submissions)

        expect(result.lastSubmitDate).toEqual(date1)
    })
})

describe("ProgressService - getDomainBreakdown", () => {
    it("should return domain breakdown of completed challenges", async () => {
        const mockUser = {
            _id: "user1",
            completedChallenges: [
                { domain: "Arrays" },
                { domain: "Arrays" },
                { domain: "Strings" },
                { domain: "Trees" },
            ],
        }

        jest.spyOn(require("../models/User"), "findById").mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockUser),
        })

        const result = await ProgressService.getDomainBreakdown("user1")

        expect(result).toEqual({
            Arrays: 2,
            Strings: 1,
            Trees: 1,
        })
    })

    it("should throw error for non-existent user", async () => {
        jest.spyOn(require("../models/User"), "findById").mockReturnValue({
            populate: jest.fn().mockResolvedValue(null),
        })

        await expect(ProgressService.getDomainBreakdown("nonexistent")).rejects.toThrow(
            "User not found",
        )
    })

    it("should handle challenges without domain", async () => {
        const mockUser = {
            _id: "user1",
            completedChallenges: [{ domain: "Arrays" }, { domain: null }, { domain: "Strings" }],
        }

        jest.spyOn(require("../models/User"), "findById").mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockUser),
        })

        const result = await ProgressService.getDomainBreakdown("user1")

        expect(result).toHaveProperty("Unknown", 1)
    })

    it("should return empty object for user with no completed challenges", async () => {
        const mockUser = {
            _id: "user1",
            completedChallenges: [],
        }

        jest.spyOn(require("../models/User"), "findById").mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockUser),
        })

        const result = await ProgressService.getDomainBreakdown("user1")

        expect(result).toEqual({})
    })
})

describe("ProgressService - getUserProgress", () => {
    it("should return user progress statistics", async () => {
        const mockUser = {
            _id: "user1",
            completedChallenges: [{ id: "c1" }, { id: "c2" }, { id: "c3" }],
        }

        jest.spyOn(require("../models/User"), "findById").mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockUser),
        })

        const result = await ProgressService.getUserProgress("user1")

        expect(result.totalCompleted).toBe(3)
        expect(result.completedChallenges).toHaveLength(3)
    })

    it("should throw error for non-existent user", async () => {
        jest.spyOn(require("../models/User"), "findById").mockReturnValue({
            populate: jest.fn().mockResolvedValue(null),
        })

        await expect(ProgressService.getUserProgress("nonexistent")).rejects.toThrow(
            "User not found",
        )
    })

    it("should return 0 completed for user with no solved challenges", async () => {
        const mockUser = {
            _id: "user1",
            completedChallenges: [],
        }

        jest.spyOn(require("../models/User"), "findById").mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockUser),
        })

        const result = await ProgressService.getUserProgress("user1")

        expect(result.totalCompleted).toBe(0)
    })
})

describe("ProgressService - getAggregatedStats", () => {
    it("should return aggregated statistics", async () => {
        const mockUsers = [
            { completedChallenges: [{ _id: "c1" }, { _id: "c2" }] },
            { completedChallenges: [{ _id: "c2" }, { _id: "c3" }] },
            { completedChallenges: [] },
        ]

        jest.spyOn(require("../models/User"), "find").mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockUsers),
        })

        const result = await ProgressService.getAggregatedStats()

        expect(result.totalUsers).toBe(3)
        expect(result.totalCompletions).toBe(4)
        expect(result.averageCompletionsPerUser).toBeCloseTo(1.33, 1)
        expect(result.uniqueChallengesSolved).toBe(3)
    })

    it("should return 0 for empty database", async () => {
        jest.spyOn(require("../models/User"), "find").mockReturnValue({
            populate: jest.fn().mockResolvedValue([]),
        })

        const result = await ProgressService.getAggregatedStats()

        expect(result.totalUsers).toBe(0)
        expect(result.totalCompletions).toBe(0)
        expect(result.averageCompletionsPerUser).toBe(0)
        expect(result.uniqueChallengesSolved).toBe(0)
    })

    it("should count unique challenges only once", async () => {
        const mockUsers = [
            { completedChallenges: [{ _id: "c1" }, { _id: "c1" }, { _id: "c2" }] },
            { completedChallenges: [{ _id: "c1" }, { _id: "c3" }] },
        ]

        jest.spyOn(require("../models/User"), "find").mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockUsers),
        })

        const result = await ProgressService.getAggregatedStats()

        expect(result.totalCompletions).toBe(5)
        expect(result.uniqueChallengesSolved).toBe(3)
    })
})

describe("ProgressService - getLeaderboard", () => {
    it("should return top users by completed challenges", async () => {
        const mockUsers = [
            { _id: "u1", name: "User 1", email: "u1@test.com", completedChallenges: [1, 2, 3] },
            { _id: "u2", name: "User 2", email: "u2@test.com", completedChallenges: [1, 2] },
        ]

        jest.spyOn(require("../models/User"), "find").mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue(mockUsers),
        })

        const result = await ProgressService.getLeaderboard(10)

        expect(result).toHaveLength(2)
        expect(result[0].totalCompleted).toBe(3)
        expect(result[1].totalCompleted).toBe(2)
    })

    it("should limit results to specified amount", async () => {
        const mockUsers = Array.from({ length: 5 }, (_, i) => ({
            _id: `u${i}`,
            name: `User ${i}`,
            email: `u${i}@test.com`,
            completedChallenges: [],
        }))

        jest.spyOn(require("../models/User"), "find").mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue(mockUsers.slice(0, 3)),
        })

        const result = await ProgressService.getLeaderboard(3)

        expect(result).toHaveLength(3)
    })

    it("should return safe user data in leaderboard", async () => {
        const mockUsers = [
            {
                _id: "u1",
                name: "User 1",
                email: "u1@test.com",
                passwordHash: "secret",
                completedChallenges: [1, 2],
            },
        ]

        jest.spyOn(require("../models/User"), "find").mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue(mockUsers),
        })

        const result = await ProgressService.getLeaderboard(10)

        expect(result[0]).toHaveProperty("id")
        expect(result[0]).toHaveProperty("name")
        expect(result[0]).toHaveProperty("email")
        expect(result[0]).not.toHaveProperty("passwordHash")
    })
})
