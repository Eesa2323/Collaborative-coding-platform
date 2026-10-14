const express = require("express")
const mongoose = require("mongoose")
const User = require("../models/User")
const router = express.Router()

// Allowed filter values expected from the frontend.
const ACCEPTED_TYPES = ["DSA", "AI", "Game Dev", "Web Dev"]
const ACCEPTED_DIFFICULTIES = ["Easy", "Medium", "Hard"]

// Normalizes different id shapes into a plain hex string when possible.
const normalizeObjectId = (rawId) => {
    if (typeof rawId === "string") {
        return rawId.trim()
    }

    if (!rawId || typeof rawId !== "object") {
        return ""
    }

    if (typeof rawId.$oid === "string") {
        return rawId.$oid.trim()
    }

    if (typeof rawId._id === "string") {
        return rawId._id.trim()
    }

    if (typeof rawId.id === "string") {
        return rawId.id.trim()
    }

    if (typeof rawId.toHexString === "function") {
        return rawId.toHexString().trim()
    }

    if (typeof rawId.toString === "function") {
        const text = rawId.toString().trim()

        return text === "[object Object]" ? "" : text
    }

    return ""
}

const toChallengePayload = (challenge, isCompleted) => ({
    _id: normalizeObjectId(challenge._id),
    title: challenge.title,
    type: challenge.type,
    difficulty: challenge.difficulty,
    challengeContent: challenge.challengeContent,
    starterTemplate: challenge.starterTemplate,
    hint: challenge.hint,
    solutions: challenge.solutions,
    result: challenge.result,
    isCompleted,
})

// GET challenge catalog for collaboration topic/question picker.
router.get("/catalog", async (req, res) => {
    try {
        // Make sure DB is ready before reading challenge docs.
        if (!mongoose.connection.db) {
            return res.status(503).json({
                message: "Database connection is not ready.",
            })
        }

        const db = mongoose.connection.db

        // Read core challenge fields and use them as collaboration questions.
        const docs = await db
            .collection("challenges")
            .find({})
            .project({
                _id: 1,
                title: 1,
                type: 1,
                difficulty: 1,
            })
            .toArray()

        const topics = Array.from(
            new Set(
                docs
                    .map((doc) => String(doc.type || "").trim())
                    .filter((topic) => topic.length > 0),
            ),
        )

        const questions = docs
            .filter((doc) => String(doc.type || "").trim().length > 0)
            .map((doc) => ({
                id: normalizeObjectId(doc._id),
                topic: String(doc.type || "").trim(),
                text: `${String(doc.title || "Untitled challenge")} (${String(doc.difficulty || "Unknown")})`,
            }))

        return res.status(200).json({
            topics,
            questions,
        })
    } catch (error) {
        return res.status(500).json({
            message: "Unable to load challenge catalog right now.",
            details: error?.message || "Unknown challenge catalog error.",
        })
    }
})

// GET challenges
router.get("/", async (req, res) => {
    try {
        // Read selected filters from query parameters.
        const { type, difficulty } = req.query

        // Validate required filters.
        if (!type || !difficulty) {
            return res.status(400).json({
                message: "Both type and difficulty query params are required.",
            })
        }

        // Enforce exact  values from the frontend.
        if (!ACCEPTED_TYPES.includes(String(type))) {
            return res.status(400).json({
                message: `Invalid type. Allowed values: ${ACCEPTED_TYPES.join(", ")}.`,
            })
        }

        if (!ACCEPTED_DIFFICULTIES.includes(String(difficulty))) {
            return res.status(400).json({
                message: `Invalid difficulty. Allowed values: ${ACCEPTED_DIFFICULTIES.join(", ")}.`,
            })
        }

        // Ensure Mongo connection is ready before reading collection data.
        if (!mongoose.connection.db) {
            return res.status(503).json({
                message: "Database connection is not ready.",
            })
        }

        // read from the intended database.
        const db = mongoose.connection.db

        // Query manually managed documents from the selected collection.
        const challenges = await db
            .collection("challenges")
            .find({
                type: String(type),
                difficulty: String(difficulty),
            })
            .project({
                _id: 1,
                title: 1,
                type: 1,
                difficulty: 1,
                challengeContent: 1,
                starterTemplate: 1,
                hint: 1,
                solutions: 1,
                result: 1,
            })
            .toArray()

        // Read current user's completed challenge ids for completion flags.
        const user = await User.findById(req.user?.userId).select({ completedChallenges: 1 }).lean()

        const completedIds = new Set(
            (user?.completedChallenges || []).map((id) => normalizeObjectId(id)),
        )

        const challengesWithCompletion = challenges.map((challenge) =>
            toChallengePayload(challenge, completedIds.has(normalizeObjectId(challenge._id))),
        )

        // Return filtered results for current dropdown selections.
        return res.status(200).json({
            count: challengesWithCompletion.length,
            challenges: challengesWithCompletion,
        })
    } catch (error) {
        // Catch and return unexpected query/runtime failures.
        console.error("Error fetching challenges:", error)
        return res.status(500).json({
            message: "Failed to fetch challenges.",
        })
    }
})

module.exports = router
