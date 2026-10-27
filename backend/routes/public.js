const express = require("express")
const mongoose = require("mongoose")
const User = require("../models/User")

const router = express.Router()

const calculateLevel = (completedChallengesCount) => {
    return Math.floor(completedChallengesCount / 4) + 1
}

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

router.get("/leaderboard", async (req, res) => {
    try {
        const users = await User.find()
            .populate("completedChallenges")
            .lean()

        const leaderboard = users
            .map((user) => {
                const challengeCount = user.completedChallenges?.length || 0
                return {
                    id: String(user._id),
                    name: String(user.name || ""),
                    email: String(user.email || ""),
                    level: calculateLevel(challengeCount),
                    completedCount: challengeCount,
                }
            })
            .sort((a, b) => {
                if (b.level !== a.level) {
                    return b.level - a.level
                }
                return b.completedCount - a.completedCount
            })

        return res.status(200).json({ users: leaderboard })
    } catch (error) {
        return res.status(500).json({
            message: "Unable to fetch leaderboard right now.",
            details: error?.message || "Unknown leaderboard error.",
        })
    }
})

router.get("/search", async (req, res) => {
    try {
        const queryText = String(req.query?.q || "").trim()

        if (!queryText) {
            return res.status(200).json({ users: [] })
        }

        const safeQuery = escapeRegExp(queryText)
        const searchMatcher = {
            $regex: safeQuery,
            $options: "i",
        }

        const users = await User.find({
            $or: [
                { name: searchMatcher },
                { email: searchMatcher },
            ],
        })
            .select({ _id: 1, name: 1, email: 1 })
            .limit(12)
            .lean()

        return res.status(200).json({
            users: users.map((user) => ({
                id: String(user._id),
                name: user.name,
                email: user.email,
            })),
        })
    } catch (error) {
        return res.status(500).json({
            message: "Unable to search users right now.",
            details: error?.message || "Unknown users search error.",
        })
    }
})

module.exports = router