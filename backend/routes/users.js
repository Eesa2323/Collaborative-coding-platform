const express = require("express")
const bcrypt = require("bcrypt")
const mongoose = require("mongoose")
const User = require("../models/User")
const Challenge = require("../models/Challenge")

const router = express.Router()

const normalizeUserResponse = (user, completedChallenges = []) => ({
    id: String(user._id),
    name: String(user.name || ""),
    email: String(user.email || ""),
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
    completedChallenges: completedChallenges.map((challenge) => ({
        id: String(challenge._id),
        title: String(challenge.title || "Untitled Challenge"),
        type: String(challenge.type || "General"),
        difficulty: String(challenge.difficulty || "Unknown"),
    })),
})

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

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

        const currentUserId = String(req.user?.userId || "").trim()
        const currentUserFilter = mongoose.Types.ObjectId.isValid(currentUserId)
            ? { _id: { $ne: new mongoose.Types.ObjectId(currentUserId) } }
            : {}

        const users = await User.find({
            ...currentUserFilter,
            $or: [
                { name: searchMatcher },
                { email: searchMatcher },
                { username: searchMatcher },
                { handle: searchMatcher },
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

router.get("/me", async (req, res) => {
    try {
        const currentUserId = String(req.user?.userId || "").trim()

        if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
            return res.status(401).json({
                message: "Login required.",
            })
        }

        const user = await User.findById(currentUserId)
            .select("name email createdAt completedChallenges")
            .populate({ path: "completedChallenges", select: "title type difficulty" })
            .lean()

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
            })
        }

        return res.status(200).json({
            user: normalizeUserResponse(user, user.completedChallenges || []),
        })
    } catch (error) {
        return res.status(500).json({
            message: "Unable to fetch profile right now.",
            details: error?.message || "Unknown profile error.",
        })
    }
})

router.put("/me", async (req, res) => {
    try {
        const currentUserId = String(req.user?.userId || "").trim()

        if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
            return res.status(401).json({
                message: "Login required.",
            })
        }

        const { name, email } = req.body || {}

        if (!name && !email) {
            return res.status(400).json({
                message: "Name or email is required to update profile.",
            })
        }

        const user = await User.findById(currentUserId)

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
            })
        }

        if (typeof name === "string" && name.trim().length > 0) {
            user.name = name.trim()
        }

        if (typeof email === "string" && email.trim().length > 0) {
            const normalizedEmail = email.toLowerCase().trim()
            const existingUser = await User.findOne({
                email: normalizedEmail,
                _id: { $ne: user._id },
            })

            if (existingUser) {
                return res.status(409).json({
                    message: "Another account already uses that email.",
                })
            }

            user.email = normalizedEmail
        }

        await user.save()

        return res.status(200).json({
            user: normalizeUserResponse(user, user.completedChallenges || []),
            message: "Profile updated successfully.",
        })
    } catch (error) {
        return res.status(500).json({
            message: "Unable to update profile right now.",
            details: error?.message || "Unknown profile update error.",
        })
    }
})

router.put("/me/password", async (req, res) => {
    try {
        const currentUserId = String(req.user?.userId || "").trim()

        if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
            return res.status(401).json({
                message: "Login required.",
            })
        }

        const { currentPassword, newPassword } = req.body || {}

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Current password and new password are required.",
            })
        }

        if (String(newPassword).length < 6) {
            return res.status(400).json({
                message: "New password must be at least 6 characters.",
            })
        }

        const user = await User.findById(currentUserId)

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
            })
        }

        const passwordMatches = await bcrypt.compare(String(currentPassword), user.passwordHash)

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Current password is incorrect.",
            })
        }

        user.passwordHash = await bcrypt.hash(String(newPassword), 10)
        await user.save()

        return res.status(200).json({
            message: "Password changed successfully.",
        })
    } catch (error) {
        return res.status(500).json({
            message: "Unable to change password right now.",
            details: error?.message || "Unknown password change error.",
        })
    }
})

module.exports = router
