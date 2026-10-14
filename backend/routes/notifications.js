const express = require("express")
const Notification = require("../models/Notification")
const Collaboration = require("../models/Collaboration")
const User = require("../models/User")
const Challenge = require("../models/Challenge")

const router = express.Router()

router.get("/", async (req, res) => {
    try {
        const userId = req.user?.userId

        // if !user return
        if (!userId) {
            return res.status(401).json({
                message: "Login required.",
            })
        }

        const notifications = await Notification.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean()

        const collaborationIds = notifications
            .filter(
                (notification) =>
                    notification.type === "collaborate_invite" &&
                    notification.data?.collaborationId,
            )
            .map((notification) => String(notification.data.collaborationId))

        const collaborations = collaborationIds.length
            ? await Collaboration.find({
                  _id: { $in: collaborationIds },
              })
                  .select({ _id: 1, status: 1 })
                  .lean()
            : []

        const collaborationStatusById = collaborations.reduce((accumulator, collaboration) => {
            accumulator[String(collaboration._id)] = collaboration.status
            return accumulator
        }, {})

        const inviteNotifications = notifications.filter(
            (notification) =>
                notification.type === "collaborate_invite" && notification.data?.collaborationId,
        )

        const senderIds = Array.from(
            new Set(
                inviteNotifications
                    .map((notification) => String(notification.data?.fromUserId || "").trim())
                    .filter((value) => value.length > 0),
            ),
        )
        const challengeIds = Array.from(
            new Set(
                inviteNotifications
                    .map((notification) => String(notification.data?.challengeId || "").trim())
                    .filter((value) => value.length > 0),
            ),
        )

        const [senders, challenges] = await Promise.all([
            senderIds.length
                ? User.find({
                      _id: { $in: senderIds },
                  })
                      .select({ _id: 1, name: 1 })
                      .lean()
                : [],
            challengeIds.length
                ? Challenge.find({
                      _id: { $in: challengeIds },
                  })
                      .select({ _id: 1, title: 1, type: 1, difficulty: 1, challengeContent: 1 })
                      .lean()
                : [],
        ])

        const senderNameById = senders.reduce((accumulator, sender) => {
            accumulator[String(sender._id)] = sender.name
            return accumulator
        }, {})
        const challengeById = challenges.reduce((accumulator, challenge) => {
            accumulator[String(challenge._id)] = challenge
            return accumulator
        }, {})

        const unreadCount = notifications.reduce(
            (count, notification) => (notification.isRead ? count : count + 1),
            0,
        )

        return res.status(200).json({
            unreadCount,
            notifications: notifications.map((notification) => {
                const notificationData = notification.data || {}
                const challenge =
                    notification.type === "collaborate_invite" && notificationData.challengeId
                        ? challengeById[String(notificationData.challengeId)]
                        : null

                return {
                    id: String(notification._id),
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    isRead: Boolean(notification.isRead),
                    data: {
                        ...notificationData,
                        ...(notification.type === "collaborate_invite" &&
                        notificationData.collaborationId
                            ? {
                                  collaborationStatus:
                                      collaborationStatusById[
                                          String(notificationData.collaborationId)
                                      ] || "pending",
                              }
                            : {}),
                        ...(notification.type === "collaborate_invite"
                            ? {
                                  fromUserName:
                                      notificationData.fromUserName ||
                                      senderNameById[String(notificationData.fromUserId)] ||
                                      "Unknown user",
                                  challengeTitle:
                                      notificationData.challengeTitle ||
                                      challenge?.title ||
                                      "Unknown challenge",
                                  challengeType:
                                      notificationData.challengeType ||
                                      challenge?.type ||
                                      "Unknown type",
                                  challengeDifficulty:
                                      notificationData.challengeDifficulty ||
                                      challenge?.difficulty ||
                                      "Unknown difficulty",
                                  challengeContent:
                                      notificationData.challengeContent ||
                                      challenge?.challengeContent ||
                                      "",
                              }
                            : {}),
                    },
                    createdAt: notification.createdAt,
                }
            }),
        })
    } catch (error) {
        console.error("Error fetching notifications:", error)
        return res.status(500).json({
            message: "Unable to load notifications right now.",
            details: error?.message || "Unknown notifications error.",
        })
    }
})

module.exports = router
