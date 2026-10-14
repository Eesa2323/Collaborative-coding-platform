const express = require("express")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const mongoose = require("mongoose")
const Community = require("../models/Community")
const CommunityPost = require("../models/CommunityPost")
const User = require("../models/User")

const router = express.Router()

const UPLOAD_DIR = path.join(__dirname, "../uploads/community-posts")
const MAX_CAPTION_LENGTH = 500
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR)
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
        cb(null, `post-${uniqueSuffix}${path.extname(file.originalname)}`)
    },
})

const upload = multer({
    storage,
    limits: { fileSize: MAX_IMAGE_SIZE },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ["image/jpeg", "image/png", "image/webp"]
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error("Only JPEG, PNG, and WebP images are allowed."))
        }
    },
})

// Normalize community data for consistent API responses
const normalizeCommunityResponse = (community, memberCount = 0, postCount = 0) => ({
    id: String(community._id),
    title: String(community.title || ""),
    description: String(community.description || ""),
    creator: {
        id: String(community.creator?._id || community.creator || ""),
        name: String(community.creator?.name || "Unknown"),
    },
    memberCount,
    postCount,
    createdAt: community.createdAt?.toISOString() || null,
})

// Normalize post data for consistent API responses
const normalizePostResponse = (post) => ({
    id: String(post._id),
    caption: String(post.caption || ""),
    // Use absolute URL path for images - served from /uploads/community-posts/
    imageUrl: post.imageUrl ? `/uploads/community-posts/${path.basename(post.imageUrl)}` : "",
    author: {
        id: String(post.author?._id || post.author || ""),
        name: String(post.author?.name || "Unknown"),
    },
    createdAt: post.createdAt?.toISOString() || null,
})

// GET all communities
router.get("/", async (req, res) => {
    try {
        // Fetch all communities, populate creator info, sort by newest first
        const communities = await Community.find()
            .populate("creator", "name email")
            .sort({ createdAt: -1 })
            .lean()

        // Enrich each community with member count and post count
        const communityData = await Promise.all(
            communities.map(async (community) => {
                const memberCount = community.members?.length || 0
                const postCount = await CommunityPost.countDocuments({
                    community: community._id,
                })
                return normalizeCommunityResponse(community, memberCount, postCount)
            }),
        )

        return res.status(200).json({
            communities: communityData,
        })
    } catch (error) {
        return res.status(500).json({
            message: "Unable to fetch communities right now.",
            details: error?.message || "Unknown error.",
        })
    }
})

// SEARCH communities
router.get("/search", async (req, res) => {
    try {
        const query = String(req.query?.q || "").trim()

        // Return empty array if query is empty
        if (!query) {
            return res.status(200).json({ communities: [] })
        }

        // Case-insensitive search on title and description fields
        const searchRegex = { $regex: query, $options: "i" }
        const communities = await Community.find({
            $or: [{ title: searchRegex }, { description: searchRegex }],
        })
            .populate("creator", "name email")
            .limit(20)
            .lean()

        // Enrich search results with member and post counts
        const communityData = await Promise.all(
            communities.map(async (community) => {
                const memberCount = community.members?.length || 0
                const postCount = await CommunityPost.countDocuments({
                    community: community._id,
                })
                return normalizeCommunityResponse(community, memberCount, postCount)
            }),
        )

        return res.status(200).json({
            communities: communityData,
        })
    } catch (error) {
        return res.status(500).json({
            message: "Unable to search communities right now.",
            details: error?.message || "Unknown error.",
        })
    }
})

// GET community details with posts
router.get("/:communityId", async (req, res) => {
    try {
        const communityId = String(req.params.communityId || "").trim()

        // Validate community ID format
        if (!mongoose.Types.ObjectId.isValid(communityId)) {
            return res.status(400).json({
                message: "Invalid community ID.",
            })
        }

        // Fetch community with creator info
        const community = await Community.findById(communityId)
            .populate("creator", "name email _id")
            .lean()

        if (!community) {
            return res.status(404).json({
                message: "Community not found.",
            })
        }

        // Fetch all posts in this community
        const posts = await CommunityPost.find({ community: communityId })
            .populate("author", "name email _id")
            .sort({ createdAt: -1 })
            .lean()

        const memberCount = community.members?.length || 0
        const postCount = posts.length

        return res.status(200).json({
            community: normalizeCommunityResponse(community, memberCount, postCount),
            posts: posts.map(normalizePostResponse),
        })
    } catch (error) {
        return res.status(500).json({
            message: "Unable to fetch community details right now.",
            details: error?.message || "Unknown error.",
        })
    }
})

// POST create community
router.post("/", async (req, res) => {
    try {
        // Get authenticated user ID from request (set by auth middleware)
        const currentUserId = String(req.user?.userId || "").trim()
        const { title, description } = req.body || {}

        // Validate user authentication
        if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
            return res.status(401).json({
                message: "Login required.",
            })
        }

        // Validate required fields
        if (!title || !description) {
            return res.status(400).json({
                message: "Title and description are required.",
            })
        }

        // Validate title length (max 100 characters)
        if (String(title).length > 100) {
            return res.status(400).json({
                message: "Title must be 100 characters or less.",
            })
        }

        // Validate description length (max 500 characters)
        if (String(description).length > 500) {
            return res.status(400).json({
                message: "Description must be 500 characters or less.",
            })
        }

        // Create community with creator as first member
        const community = await Community.create({
            title: String(title).trim(),
            description: String(description).trim(),
            creator: new mongoose.Types.ObjectId(currentUserId),
            members: [new mongoose.Types.ObjectId(currentUserId)],
        })

        // Populate creator info for response
        const populatedCommunity = await Community.findById(community._id)
            .populate("creator", "name email _id")
            .lean()

        return res.status(201).json({
            community: normalizeCommunityResponse(populatedCommunity, 1, 0),
            message: "Community created successfully.",
        })
    } catch (error) {
        return res.status(500).json({
            message: "Unable to create community right now.",
            details: error?.message || "Unknown error.",
        })
    }
})

// POST join community
router.post("/:communityId/join", async (req, res) => {
    try {
        // Get authenticated user ID
        const currentUserId = String(req.user?.userId || "").trim()
        const communityId = String(req.params.communityId || "").trim()

        // Validate user authentication
        if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
            return res.status(401).json({
                message: "Login required.",
            })
        }

        // Validate community ID format
        if (!mongoose.Types.ObjectId.isValid(communityId)) {
            return res.status(400).json({
                message: "Invalid community ID.",
            })
        }

        // Fetch community to check existence
        const community = await Community.findById(communityId)

        if (!community) {
            return res.status(404).json({
                message: "Community not found.",
            })
        }

        // Check if user is already a member (idempotent - multiple joins return same result)
        const userObjectId = new mongoose.Types.ObjectId(currentUserId)
        const alreadyMember = community.members.some(
            (memberId) => String(memberId) === currentUserId,
        )

        if (alreadyMember) {
            return res.status(400).json({
                message: "You are already a member of this community.",
            })
        }

        // Add user to community members
        community.members.push(userObjectId)
        await community.save()

        return res.status(200).json({
            message: "Joined community successfully.",
        })
    } catch (error) {
        return res.status(500).json({
            message: "Unable to join community right now.",
            details: error?.message || "Unknown error.",
        })
    }
})

// POST create community post
router.post("/:communityId/posts", upload.single("image"), async (req, res) => {
    try {
        const currentUserId = String(req.user?.userId || "").trim()
        const communityId = String(req.params.communityId || "").trim()
        const caption = String(req.body?.caption || "").trim()

        // Validate user authentication, clean up uploaded file if invalid
        if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
            if (req.file) {
                fs.unlinkSync(req.file.path) // Clean up uploaded file
            }
            return res.status(401).json({
                message: "Login required.",
            })
        }

        // Validate community ID, clean up uploaded file if invalid
        if (!mongoose.Types.ObjectId.isValid(communityId)) {
            if (req.file) {
                fs.unlinkSync(req.file.path)
            }
            return res.status(400).json({
                message: "Invalid community ID.",
            })
        }

        // Validate caption length
        if (caption.length > MAX_CAPTION_LENGTH) {
            if (req.file) {
                fs.unlinkSync(req.file.path)
            }
            return res.status(400).json({
                message: `Caption must be ${MAX_CAPTION_LENGTH} characters or less.`,
            })
        }

        // Post must have either caption or image (or both)
        if (!caption && !req.file) {
            return res.status(400).json({
                message: "Post must have either a caption or an image.",
            })
        }

        // Verify community exists
        const community = await Community.findById(communityId)

        if (!community) {
            if (req.file) {
                fs.unlinkSync(req.file.path)
            }
            return res.status(404).json({
                message: "Community not found.",
            })
        }

        // Create the post with image URL if file was uploaded
        const post = await CommunityPost.create({
            community: new mongoose.Types.ObjectId(communityId),
            author: new mongoose.Types.ObjectId(currentUserId),
            caption: caption || "",
            imageUrl: req.file ? req.file.path : "",
            imageFileName: req.file ? req.file.filename : "",
        })

        // Populate author info for response
        const populatedPost = await CommunityPost.findById(post._id)
            .populate("author", "name email _id")
            .lean()

        return res.status(201).json({
            post: normalizePostResponse(populatedPost),
            message: "Post created successfully.",
        })
    } catch (error) {
        // Clean up uploaded file on error
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path)
            } catch {
                // Ignore file deletion error
            }
        }
        return res.status(500).json({
            message: "Unable to create post right now.",
            details: error?.message || "Unknown error.",
        })
    }
})

// DELETE community post
router.delete("/:communityId/posts/:postId", async (req, res) => {
    try {
        const currentUserId = String(req.user?.userId || "").trim()
        const postId = String(req.params.postId || "").trim()
        const communityId = String(req.params.communityId || "").trim()

        // Validate user authentication
        if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
            return res.status(401).json({
                message: "Login required.",
            })
        }

        // Validate post ID format
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                message: "Invalid post ID.",
            })
        }

        // Fetch post to verify existence and ownership
        const post = await CommunityPost.findById(postId)

        if (!post) {
            return res.status(404).json({
                message: "Post not found.",
            })
        }

        // Verify the requesting user is the post author
        if (String(post.author) !== currentUserId) {
            return res.status(403).json({
                message: "You can only delete your own posts.",
            })
        }

        // Delete associated image file if it exists
        if (post.imageFileName) {
            const imagePath = path.join(UPLOAD_DIR, post.imageFileName)
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath)
            }
        }

        // Delete the post from database
        await CommunityPost.findByIdAndDelete(postId)

        return res.status(200).json({
            message: "Post deleted successfully.",
        })
    } catch (error) {
        return res.status(500).json({
            message: "Unable to delete post right now.",
            details: error?.message || "Unknown error.",
        })
    }
})

module.exports = router
