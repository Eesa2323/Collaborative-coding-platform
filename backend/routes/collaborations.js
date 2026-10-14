const express = require("express")
const mongoose = require("mongoose")
const User = require("../models/User")
const Challenge = require("../models/Challenge")
const Collaboration = require("../models/Collaboration")
const Notification = require("../models/Notification")

const router = express.Router()

const toPopulatedCollaborationPayload = (collaboration, currentUserId) => {
    if (!collaboration) {
        return null
    }

    const fromUser = collaboration.fromUser || {}
    const toUser = collaboration.toUser || {}
    const challenge = collaboration.challengeId || {}

    return {
        id: String(collaboration._id),
        status: String(collaboration.status || "pending"),
        topic: String(collaboration.topic || ""),
        challengeId: String(challenge._id || collaboration.challengeId || ""),
        challenge: {
            _id: String(challenge._id || collaboration.challengeId || ""),
            title: String(challenge.title || ""),
            type: String(challenge.type || ""),
            difficulty: String(challenge.difficulty || ""),
            challengeContent: String(challenge.challengeContent || ""),
            starterTemplate: challenge.starterTemplate || {},
            hint: String(challenge.hint || ""),
            solutions: challenge.solutions || {},
            result: challenge.result ?? null,
        },
        fromUser: {
            id: String(fromUser._id || collaboration.fromUser || ""),
            name: String(fromUser.name || "Unknown user"),
        },
        toUser: {
            id: String(toUser._id || collaboration.toUser || ""),
            name: String(toUser.name || "Unknown user"),
        },
        collaborator:
            String(fromUser._id || collaboration.fromUser || "") === String(currentUserId)
                ? {
                      id: String(toUser._id || collaboration.toUser || ""),
                      name: String(toUser.name || "Unknown user"),
                  }
                : {
                      id: String(fromUser._id || collaboration.fromUser || ""),
                      name: String(fromUser.name || "Unknown user"),
                  },
        createdAt: collaboration.createdAt,
        updatedAt: collaboration.updatedAt,
    }
}

router.get("/active", async (req, res) => {
    try {
        const userId = req.user?.userId

        if (!userId) {
            return res.status(401).json({
                message: "Login required.",
            })
        }

        const collaborations = await Collaboration.find({
            status: "accepted",
            $or: [{ fromUser: userId }, { toUser: userId }],
        })
            .populate({
                path: "fromUser",
                select: { _id: 1, name: 1 },
            })
            .populate({
                path: "toUser",
                select: { _id: 1, name: 1 },
            })
            .populate({
                path: "challengeId",
                select: {
                    _id: 1,
                    title: 1,
                    type: 1,
                    difficulty: 1,
                    challengeContent: 1,
                    starterTemplate: 1,
                    hint: 1,
                    solutions: 1,
                    result: 1,
                },
            })
            .sort({ updatedAt: -1 })
            .lean()

        return res.status(200).json({
            count: collaborations.length,
            collaborations: collaborations.map((collaboration) =>
                toPopulatedCollaborationPayload(collaboration, userId),
            ),
        })
    } catch (error) {
        console.error("Error fetching active collaborations:", error)
        return res.status(500).json({
            message: "Unable to load active collaborations right now.",
            details: error?.message || "Unknown collaborations list error.",
        })
    }
})

router.post("/invite", async (req, res) => {
    try {
        const senderId = req.user?.userId
        const { userId, topic, questionId } = req.body || {}

        if (!senderId) {
            return res.status(401).json({
                message: "Login required.",
            })
        }

        const senderObjectId = mongoose.Types.ObjectId.isValid(senderId)
            ? new mongoose.Types.ObjectId(senderId)
            : null
        const receiverObjectId = mongoose.Types.ObjectId.isValid(String(userId || "").trim())
            ? new mongoose.Types.ObjectId(String(userId).trim())
            : null
        const challengeObjectId = mongoose.Types.ObjectId.isValid(String(questionId || "").trim())
            ? new mongoose.Types.ObjectId(String(questionId).trim())
            : null

        if (
            !senderObjectId ||
            !receiverObjectId ||
            !challengeObjectId ||
            !String(topic || "").trim()
        ) {
            return res.status(400).json({
                message: "userId, topic, and questionId are required.",
            })
        }

        if (String(senderObjectId) === String(receiverObjectId)) {
            return res.status(400).json({
                message: "You cannot invite yourself to collaborate.",
            })
        }

        const receiver = await User.findById(receiverObjectId).select({ _id: 1, name: 1 }).lean()

        if (!receiver) {
            return res.status(404).json({
                message: "The selected user no longer exists.",
            })
        }

        const sender = await User.findById(senderObjectId).select({ _id: 1, name: 1 }).lean()
        const challenge = await Challenge.findById(challengeObjectId)
            .select({ _id: 1, title: 1, type: 1, difficulty: 1 })
            .lean()

        if (!challenge) {
            return res.status(404).json({
                message: "The selected question no longer exists.",
            })
        }

        const collaboration = await Collaboration.create({
            fromUser: senderObjectId,
            toUser: receiverObjectId,
            topic: String(topic).trim(),
            challengeId: challengeObjectId,
            status: "pending",
        })

        await Notification.create({
            user: receiverObjectId,
            type: "collaborate_invite",
            title: "New collaboration invite",
            message: `You have a new collaboration invite on ${String(topic).trim()}.`,
            data: {
                collaborationId: String(collaboration._id),
                fromUserId: String(senderObjectId),
                fromUserName: sender?.name || "Unknown user",
                challengeId: String(challengeObjectId),
                challengeTitle: challenge.title,
                challengeType: challenge.type,
                challengeDifficulty: challenge.difficulty,
                topic: String(topic).trim(),
            },
        })

        return res.status(201).json({
            message: "Collaboration invite sent.",
            collaboration: {
                id: String(collaboration._id),
                topic: collaboration.topic,
                questionId: String(collaboration.challengeId),
                invitedUserId: String(receiverObjectId),
                status: collaboration.status,
            },
        })
    } catch (error) {
        console.error("Error creating collaboration invite:", error)
        return res.status(500).json({
            message: "Unable to create collaboration invite right now.",
            details: error?.message || "Unknown collaboration error.",
        })
    }
})

router.post("/respond", async (req, res) => {
    try {
        const userId = req.user?.userId
        const { collaborationId, action } = req.body || {}

        if (!userId) {
            return res.status(401).json({
                message: "Login required.",
            })
        }

        const collaborationObjectId = mongoose.Types.ObjectId.isValid(
            String(collaborationId || "").trim(),
        )
            ? new mongoose.Types.ObjectId(String(collaborationId).trim())
            : null

        const normalizedAction = String(action || "")
            .trim()
            .toLowerCase()

        if (!collaborationObjectId || !["accept", "decline"].includes(normalizedAction)) {
            return res.status(400).json({
                message: "collaborationId and a valid action are required.",
            })
        }

        const collaboration = await Collaboration.findById(collaborationObjectId)

        if (!collaboration) {
            return res.status(404).json({
                message: "The collaboration invite no longer exists.",
            })
        }

        if (String(collaboration.toUser) !== String(userId)) {
            return res.status(403).json({
                message: "You can only respond to invites sent to you.",
            })
        }

        if (collaboration.status !== "pending") {
            return res.status(409).json({
                message: "This collaboration invite has already been handled.",
                status: collaboration.status,
            })
        }

        collaboration.status = normalizedAction === "accept" ? "accepted" : "declined"
        await collaboration.save()

        await collaboration.populate([
            {
                path: "fromUser",
                select: { _id: 1, name: 1 },
            },
            {
                path: "toUser",
                select: { _id: 1, name: 1 },
            },
            {
                path: "challengeId",
                select: {
                    _id: 1,
                    title: 1,
                    type: 1,
                    difficulty: 1,
                    challengeContent: 1,
                    starterTemplate: 1,
                    hint: 1,
                    solutions: 1,
                    result: 1,
                },
            },
        ])

        // Mark the related notification(s) as handled and store the action
        await Notification.updateMany(
            {
                user: userId,
                type: "collaborate_invite",
                "data.collaborationId": String(collaborationObjectId),
            },
            {
                $set: {
                    isRead: true,
                    "data.collaborationStatus": collaboration.status,
                },
            },
        )

        // Notify the inviter that the invite was responded to
        try {
            const inviterId = String(collaboration.fromUser)

            await Notification.create({
                user: inviterId,
                type: "collaborate_response",
                title:
                    normalizedAction === "accept"
                        ? "Your collaboration invite was accepted"
                        : "Your collaboration invite was declined",
                message: `Your collaboration invite on ${String(
                    collaboration.topic || "a topic",
                )} was ${normalizedAction === "accept" ? "accepted" : "declined"}.`,
                data: {
                    collaborationId: String(collaboration._id),
                    action: collaboration.status,
                    fromUserId: String(userId), // the user who responded
                    challengeId: String(collaboration.challengeId),
                    topic: String(collaboration.topic || ""),
                },
            })
        } catch (notifyErr) {
            console.error("Failed to create inviter notification:", notifyErr)
        }

        return res.status(200).json({
            message:
                normalizedAction === "accept"
                    ? "Collaboration invite accepted."
                    : "Collaboration invite declined.",
            collaboration: toPopulatedCollaborationPayload(collaboration, userId),
        })
    } catch (error) {
        console.error("Error responding to collaboration invite:", error)
        return res.status(500).json({
            message: "Unable to update collaboration invite right now.",
            details: error?.message || "Unknown collaboration response error.",
        })
    }
})

module.exports = router
