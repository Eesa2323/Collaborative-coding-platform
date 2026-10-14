const mongoose = require("mongoose")

const communityPostSchema = new mongoose.Schema(
    {
        community: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Community",
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        caption: {
            type: String,
            trim: true,
            default: "",
        },
        imageUrl: {
            type: String,
            default: "",
        },
        imageFileName: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    },
)

module.exports = mongoose.model("CommunityPost", communityPostSchema)
