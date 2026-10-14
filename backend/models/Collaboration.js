const mongoose = require("mongoose")

const collaborationSchema = new mongoose.Schema(
    {
        fromUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        toUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        topic: {
            type: String,
            required: true,
            trim: true,
        },
        challengeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Challenge",
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "declined"],
            default: "pending",
        },
    },
    {
        timestamps: true,
    },
)

module.exports =
    mongoose.models.Collaboration || mongoose.model("Collaboration", collaborationSchema)
