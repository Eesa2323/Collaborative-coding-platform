const mongoose = require("mongoose")

const challengeSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        type: { type: String, required: true },
        difficulty: { type: String, required: true },
        challengeContent: { type: String, required: true },
        starterTemplate: { type: mongoose.Schema.Types.Mixed, default: {} },
        hint: { type: String, default: "" },
        solutions: { type: mongoose.Schema.Types.Mixed, default: {} },
        result: { type: mongoose.Schema.Types.Mixed, default: null },
    },
    {
        collection: "challenges",
        timestamps: true,
    },
)

module.exports = mongoose.models.Challenge || mongoose.model("Challenge", challengeSchema)
