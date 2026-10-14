const User = require("../models/User")
const Challenge = require("../models/Challenge")

class ProgressService {
    /**
     * Get user progress statistics
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Progress statistics
     */
    async getUserProgress(userId) {
        const user = await User.findById(userId).populate("completedChallenges")

        if (!user) {
            throw new Error("User not found")
        }

        return {
            totalCompleted: user.completedChallenges.length,
            completedChallenges: user.completedChallenges,
        }
    }

    /**
     * Get domain-level statistics for challenges
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Domain breakdown of completed challenges
     */
    async getDomainBreakdown(userId) {
        const user = await User.findById(userId).populate("completedChallenges")

        if (!user) {
            throw new Error("User not found")
        }

        const domainMap = {}

        user.completedChallenges.forEach((challenge) => {
            const domain = challenge.domain || "Unknown"
            if (!domainMap[domain]) {
                domainMap[domain] = 0
            }
            domainMap[domain]++
        })

        return domainMap
    }

    /**
     * Calculate user streak
     * Streak is maintained if user solves at least one challenge per UTC calendar day
     * @param {string} userId - User ID
     * @param {Array<Object>} submissions - Array of submission records with timestamps
     * @returns {Object} Streak information { currentStreak: number, longestStreak: number, lastSubmitDate: Date }
     */
    calculateStreak(submissions = []) {
        if (!Array.isArray(submissions) || submissions.length === 0) {
            return {
                currentStreak: 0,
                longestStreak: 0,
                lastSubmitDate: null,
            }
        }

        // Sort submissions by date in descending order
        const sorted = submissions
            .filter((s) => s && s.createdAt)
            .map((s) => ({
                date: new Date(s.createdAt),
            }))
            .sort((a, b) => b.date - a.date)

        if (sorted.length === 0) {
            return {
                currentStreak: 0,
                longestStreak: 0,
                lastSubmitDate: null,
            }
        }

        let currentStreak = 1
        let longestStreak = 1
        let lastSubmitDate = sorted[0].date

        // Get UTC midnight dates
        const getUTCMidnight = (date) => {
            const d = new Date(date)
            d.setUTCHours(0, 0, 0, 0)
            return d.getTime()
        }

        let previousMidnight = getUTCMidnight(sorted[0].date)

        for (let i = 1; i < sorted.length; i++) {
            const currentMidnight = getUTCMidnight(sorted[i].date)
            const dayDiff = (previousMidnight - currentMidnight) / (1000 * 60 * 60 * 24)

            if (dayDiff === 1) {
                // Consecutive day
                currentStreak++
                longestStreak = Math.max(longestStreak, currentStreak)
            } else if (dayDiff > 1) {
                // Gap in streak - stop checking current streak
                break
            }

            previousMidnight = currentMidnight
        }

        return {
            currentStreak,
            longestStreak,
            lastSubmitDate,
        }
    }

    /**
     * Calculate aggregated statistics across all users
     * @returns {Promise<Object>} Aggregated statistics
     */
    async getAggregatedStats() {
        const users = await User.find().populate("completedChallenges")

        if (!users || users.length === 0) {
            return {
                totalUsers: 0,
                totalCompletions: 0,
                averageCompletionsPerUser: 0,
                uniqueChallengesSolved: 0,
            }
        }

        const totalCompletions = users.reduce(
            (sum, user) => sum + (user.completedChallenges?.length || 0),
            0,
        )

        const uniqueChallenges = new Set()
        users.forEach((user) => {
            user.completedChallenges?.forEach((challenge) => {
                uniqueChallenges.add(String(challenge._id))
            })
        })

        return {
            totalUsers: users.length,
            totalCompletions,
            averageCompletionsPerUser: users.length > 0 ? totalCompletions / users.length : 0,
            uniqueChallengesSolved: uniqueChallenges.size,
        }
    }

    /**
     * Get leaderboard ranking by completed challenges
     * @param {number} limit - Number of top users to return
     * @returns {Promise<Array<Object>>} Leaderboard entries
     */
    async getLeaderboard(limit = 10) {
        const users = await User.find()
            .populate("completedChallenges")
            .sort({ completedChallenges: -1 })
            .limit(limit)

        return users.map((user) => ({
            id: String(user._id),
            name: user.name,
            email: user.email,
            totalCompleted: user.completedChallenges?.length || 0,
        }))
    }
}

module.exports = new ProgressService()
