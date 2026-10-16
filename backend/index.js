const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const path = require("path")
const mongoose = require("mongoose")
const config = require("config")
const { createServer } = require("http")
const { Server } = require("socket.io")
const challengesRouter = require("./routes/challenges")
const executeRouter = require("./routes/execute")
const usersRouter = require("./routes/users")
const collaborationsRouter = require("./routes/collaborations")
const notificationsRouter = require("./routes/notifications")
const authRouter = require("./routes/auth")
const communitiesRouter = require("./routes/communities")
const Collaboration = require("./models/Collaboration")
const User = require("./models/User")
const requireAuth = require("./middleware/auth")
const { verifyAccessToken } = require("./utils/accessToken")
const { getMongoDbUri } = require("./config/env")
const {
    SUPPORTED_LANGUAGES,
    MAX_CODE_LENGTH,
    MAX_STDIN_LENGTH,
    executeSubmission,
    normalizeObjectId,
} = require("./utils/runSubmission")

const app = express()
const httpServer = createServer(app)
const PORT = process.env.PORT || 5000
const corsOrigin = process.env.CORS_ORIGIN || config.get("corsOrigin")
const collaborationRoomState = new Map()

// MongoDB Connection
const mongodbURI = getMongoDbUri()

const normalizeCodeByLanguage = (value) => {
    if (!value || typeof value !== "object") {
        return {}
    }

    return Object.entries(value).reduce((accumulator, [language, code]) => {
        if (typeof language === "string" && typeof code === "string") {
            accumulator[language] = code
        }

        return accumulator
    }, {})
}

const normalizeExecutionPayload = (payload = {}) => {
    const language = String(payload.language || "").trim()
    const sourceCode = typeof payload.sourceCode === "string" ? payload.sourceCode : ""
    const stdin = typeof payload.stdin === "string" ? payload.stdin : ""
    const expectedOutput = typeof payload.expectedOutput === "string" ? payload.expectedOutput : ""
    const challengeId = normalizeObjectId(payload.challengeId)

    return { language, sourceCode, stdin, expectedOutput, challengeId }
}

const ensureRoomState = (roomId) => {
    const previousState = collaborationRoomState.get(roomId) || {}
    const nextState = {
        codeByLanguage: normalizeCodeByLanguage(previousState.codeByLanguage),
        updatedAt: previousState.updatedAt || null,
        updatedBy: previousState.updatedBy || null,
        runState: previousState.runState || null,
    }

    collaborationRoomState.set(roomId, nextState)

    return nextState
}

const collaborationRoomName = (collaborationId) => `collaboration:${collaborationId}`

mongoose
    .connect(mongodbURI, {
        dbName: "codecraft",
    })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err))

const io = new Server(httpServer, {
    cors: {
        origin: corsOrigin,
        credentials: true,
    },
})

io.use((socket, next) => {
    const rawToken = socket.handshake.auth?.token || socket.handshake.headers.authorization || ""
    const token = rawToken.startsWith("Bearer ") ? rawToken.slice(7) : rawToken

    if (!token) {
        return next(new Error("Authentication required."))
    }

    try {
        const payload = verifyAccessToken(token)
        const userId = String(payload?.userId || "").trim()

        if (!userId) {
            return next(new Error("Authentication required."))
        }

        socket.data.user = {
            id: userId,
            name: String(payload?.name || "Unknown user"),
            email: String(payload?.email || ""),
        }

        return next()
    } catch {
        return next(new Error("Session expired. Please log in again."))
    }
})

io.on("connection", (socket) => {
    socket.on("collaboration:join", async (payload = {}, ack) => {
        try {
            const collaborationId = normalizeObjectId(payload.collaborationId)

            if (!collaborationId) {
                if (typeof ack === "function") {
                    ack({ ok: false, message: "collaborationId is required." })
                }

                return
            }

            const collaboration = await Collaboration.findById(collaborationId)
                .select({
                    _id: 1,
                    fromUser: 1,
                    toUser: 1,
                    status: 1,
                })
                .lean()

            if (!collaboration) {
                if (typeof ack === "function") {
                    ack({ ok: false, message: "The collaboration session no longer exists." })
                }

                return
            }

            const currentUserId = socket.data.user?.id || ""
            const isParticipant =
                String(collaboration.fromUser) === currentUserId ||
                String(collaboration.toUser) === currentUserId

            if (!isParticipant) {
                if (typeof ack === "function") {
                    ack({ ok: false, message: "You are not part of this collaboration." })
                }

                return
            }

            if (collaboration.status !== "accepted") {
                if (typeof ack === "function") {
                    ack({ ok: false, message: "Only accepted collaborations can be opened." })
                }

                return
            }

            const roomId = collaborationRoomName(collaborationId)
            socket.join(roomId)

            const providedState = normalizeCodeByLanguage(payload.starterCodeByLanguage)
            const previousState = collaborationRoomState.get(roomId) || {
                codeByLanguage: {},
                updatedAt: null,
                updatedBy: null,
                runState: null,
            }

            const nextState = {
                codeByLanguage: {
                    ...providedState,
                    ...previousState.codeByLanguage,
                },
                updatedAt: previousState.updatedAt,
                updatedBy: previousState.updatedBy,
                runState: previousState.runState,
            }

            if (!previousState.updatedAt && Object.keys(nextState.codeByLanguage).length > 0) {
                nextState.updatedAt = new Date().toISOString()
                nextState.updatedBy = socket.data.user
            }

            collaborationRoomState.set(roomId, nextState)

            if (typeof ack === "function") {
                ack({
                    ok: true,
                    roomId,
                    collaborationId,
                    roomState: nextState,
                })
            }
        } catch (error) {
            if (typeof ack === "function") {
                ack({
                    ok: false,
                    message: error?.message || "Unable to join collaboration room.",
                })
            }
        }
    })

    socket.on("collaboration:run", async (payload = {}, ack) => {
        const collaborationId = normalizeObjectId(payload.collaborationId)
        const roomId = collaborationRoomName(collaborationId)
        const normalizedPayload = normalizeExecutionPayload(payload)

        if (!collaborationId) {
            if (typeof ack === "function") {
                ack({ ok: false, message: "collaborationId is required." })
            }

            return
        }

        if (!normalizedPayload.language || !SUPPORTED_LANGUAGES[normalizedPayload.language]) {
            if (typeof ack === "function") {
                ack({ ok: false, message: "Unsupported language." })
            }

            return
        }

        if (
            typeof normalizedPayload.sourceCode !== "string" ||
            normalizedPayload.sourceCode.trim().length === 0
        ) {
            if (typeof ack === "function") {
                ack({
                    ok: false,
                    message: "sourceCode is required and must be a non-empty string.",
                })
            }

            return
        }

        if (normalizedPayload.sourceCode.length > MAX_CODE_LENGTH) {
            if (typeof ack === "function") {
                ack({
                    ok: false,
                    message: `sourceCode exceeds max length of ${MAX_CODE_LENGTH} characters.`,
                })
            }

            return
        }

        if (normalizedPayload.stdin.length > MAX_STDIN_LENGTH) {
            if (typeof ack === "function") {
                ack({
                    ok: false,
                    message: `stdin exceeds max length of ${MAX_STDIN_LENGTH} characters.`,
                })
            }

            return
        }

        try {
            const collaboration = await Collaboration.findById(collaborationId)
                .select({
                    _id: 1,
                    fromUser: 1,
                    toUser: 1,
                    status: 1,
                    challengeId: 1,
                })
                .lean()

            if (!collaboration) {
                if (typeof ack === "function") {
                    ack({ ok: false, message: "The collaboration session no longer exists." })
                }

                return
            }

            const currentUserId = socket.data.user?.id || ""
            const isParticipant =
                String(collaboration.fromUser) === currentUserId ||
                String(collaboration.toUser) === currentUserId

            if (!isParticipant) {
                if (typeof ack === "function") {
                    ack({ ok: false, message: "You are not part of this collaboration." })
                }

                return
            }

            if (collaboration.status !== "accepted") {
                if (typeof ack === "function") {
                    ack({ ok: false, message: "Only accepted collaborations can be opened." })
                }

                return
            }

            const roomState = ensureRoomState(roomId)

            if (roomState.runState?.active) {
                if (typeof ack === "function") {
                    ack({ ok: false, message: "Another run is already in progress." })
                }

                return
            }

            const runState = {
                active: true,
                startedAt: new Date().toISOString(),
                startedBy: socket.data.user,
            }

            roomState.runState = runState
            collaborationRoomState.set(roomId, roomState)

            io.to(roomId).emit("collaboration:run_started", {
                collaborationId,
                startedAt: runState.startedAt,
                startedBy: runState.startedBy,
                language: normalizedPayload.language,
            })

            if (typeof ack === "function") {
                ack({ ok: true, startedAt: runState.startedAt })
            }

            const executionResult = await executeSubmission(normalizedPayload)

            if (executionResult.isCorrect === true) {
                const challengeObjectId = normalizeObjectId(executionResult.challengeId)

                if (mongoose.Types.ObjectId.isValid(challengeObjectId)) {
                    await User.updateMany(
                        {
                            _id: {
                                $in: [collaboration.fromUser, collaboration.toUser],
                            },
                        },
                        {
                            $addToSet: {
                                completedChallenges: new mongoose.Types.ObjectId(challengeObjectId),
                            },
                        },
                    )
                }
            }

            io.to(roomId).emit("collaboration:run_result", {
                collaborationId,
                runBy: socket.data.user,
                runAt: new Date().toISOString(),
                ...executionResult,
            })
        } catch (error) {
            io.to(roomId).emit("collaboration:run_result", {
                collaborationId,
                runBy: socket.data.user,
                runAt: new Date().toISOString(),
                isCorrect: null,
                language: normalizedPayload.language,
                message: error?.message || "Unexpected error while executing code.",
                details: error?.details || error?.message || "Unknown execution error.",
            })
        } finally {
            const roomState = collaborationRoomState.get(roomId)

            if (roomState?.runState?.active) {
                roomState.runState = null
                collaborationRoomState.set(roomId, roomState)
                io.to(roomId).emit("collaboration:run_unlocked", {
                    collaborationId,
                    unlockedAt: new Date().toISOString(),
                })
            }
        }
    })

    socket.on("collaboration:code_change", (payload = {}, ack) => {
        const collaborationId = normalizeObjectId(payload.collaborationId)
        const roomId = collaborationRoomName(collaborationId)
        const language = String(payload.language || "").trim()
        const code = typeof payload.code === "string" ? payload.code : ""

        if (!collaborationId || !language) {
            if (typeof ack === "function") {
                ack({ ok: false, message: "collaborationId and language are required." })
            }

            return
        }

        if (!socket.rooms.has(roomId)) {
            if (typeof ack === "function") {
                ack({ ok: false, message: "Join the collaboration room first." })
            }

            return
        }

        const previousState = collaborationRoomState.get(roomId) || {
            codeByLanguage: {},
            updatedAt: null,
            updatedBy: null,
            runState: null,
        }
        const nextState = {
            codeByLanguage: {
                ...previousState.codeByLanguage,
                [language]: code,
            },
            updatedAt: new Date().toISOString(),
            updatedBy: socket.data.user,
            runState: previousState.runState,
        }

        collaborationRoomState.set(roomId, nextState)

        socket.to(roomId).emit("collaboration:code_update", {
            collaborationId,
            language,
            code,
            codeByLanguage: nextState.codeByLanguage,
            updatedAt: nextState.updatedAt,
            updatedBy: nextState.updatedBy,
        })

        if (typeof ack === "function") {
            ack({ ok: true, updatedAt: nextState.updatedAt })
        }
    })
})

// Middleware
app.use(
    cors({
        origin: corsOrigin,
        credentials: true,
    }),
)
app.use(bodyParser.json())
app.use(cookieParser())

// Serve static files for uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// API routes
app.use("/api/auth", authRouter)
app.use("/api/challenges", requireAuth, challengesRouter)
app.use("/api/execute", requireAuth, executeRouter)
app.use("/api/users", requireAuth, usersRouter)
app.use("/api/collaborations", requireAuth, collaborationsRouter)
app.use("/api/notifications", requireAuth, notificationsRouter)
app.use("/api/communities", requireAuth, communitiesRouter)
// Global error middleware
app.use((error, req, res, next) => {
    console.error("[GlobalError]", {
        method: req.method,
        path: req.originalUrl,
        message: error?.message || "Unknown error",
        stack: error?.stack || null,
    })

    if (res.headersSent) {
        return next(error)
    }

    const statusCode = Number(error?.status || error?.statusCode || 500)
    const message =
        statusCode >= 500
            ? "Unexpected server error. Please try again later."
            : error?.message || "Request failed."

    return res.status(statusCode).json({
        message,
        details:
            process.env.NODE_ENV === "production" && statusCode >= 500
                ? undefined
                : error?.message || "Unknown backend error.",
    })
})

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`))
