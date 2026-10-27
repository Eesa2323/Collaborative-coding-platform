const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
    {
        // Display name used in the UI.
        name: {
            type: String,
            required: true,
            trim: true,
        },

        // Email is unique and used as login id.
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        // Password is stored as a hash
        passwordHash: {
            type: String,
            required: true,
        },

        //  store a hash of refresh token so we can rotate and revoke sessions.
        refreshTokenHash: {
            type: String,
            default: "",
        },

// Tracks solved challenges so we can mark cards as completed in the UI.
    completedChallenges: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Challenge",
        },
    ],

    // Recent profile searches (last 16)
    recentHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    },
    {
        timestamps: true,
    },
)

module.exports = mongoose.model("User", userSchema)
