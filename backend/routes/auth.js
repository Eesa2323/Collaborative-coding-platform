const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const config = require("config")
const User = require("../models/User")
const { getJwtAccessSecret, getJwtRefreshSecret } = require("../config/env")

const router = express.Router()

// Cookie name for refresh token.
const REFRESH_COOKIE_NAME = "codecraft_refresh"

// Secrets are required from the environment; token lifetimes have safe defaults.
const accessTokenSecret = getJwtAccessSecret()
const refreshTokenSecret = getJwtRefreshSecret()
const accessTokenTtl = process.env.JWT_ACCESS_TTL || config.get("accessTokenTtl")
const refreshTokenTtl = process.env.JWT_REFRESH_TTL || config.get("refreshTokenTtl")

// Cookie settings for refresh token.
const getRefreshCookieOptions = () => ({
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 7,
})

// Return only safe user fields to the frontend.
const toSafeUser = (user) => ({
    id: String(user._id),
    name: user.name,
    email: user.email,
})

// Create short-lived access token.
const createAccessToken = (user) =>
    jwt.sign(
        {
            userId: String(user._id),
            email: user.email,
            name: user.name,
        },
        accessTokenSecret,
        { expiresIn: accessTokenTtl },
    )

// Create long-lived refresh token.
const createRefreshToken = (user) =>
    jwt.sign(
        {
            userId: String(user._id),
        },
        refreshTokenSecret,
        { expiresIn: refreshTokenTtl },
    )

// Save hashed refresh token and send cookie.
const issueSession = async (res, user) => {
    const accessToken = createAccessToken(user)
    const refreshToken = createRefreshToken(user)
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10)

    user.refreshTokenHash = refreshTokenHash
    await user.save()

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions())

    return {
        accessToken,
        user: toSafeUser(user),
    }
}

// Signup route. Keep this optional for your app flow.
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body || {}

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required.",
            })
        }

        if (String(name).trim().length > 30) {
            return res.status(400).json({
                message: "Name must be 30 characters or less.",
            })
        }

        if (String(email).trim().length > 60) {
            return res.status(400).json({
                message: "Email must be 60 characters or less.",
            })
        }

        if (String(password).length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters.",
            })
        }

        const normalizedEmail = String(email).toLowerCase().trim()
        const existingUser = await User.findOne({ email: normalizedEmail })

        if (existingUser) {
            return res.status(409).json({
                message: "An account with this email already exists.",
            })
        }

        const passwordHash = await bcrypt.hash(String(password), 10)
        const newUser = await User.create({
            name: String(name).trim(),
            email: normalizedEmail,
            passwordHash,
        })

        const session = await issueSession(res, newUser)

        return res.status(201).json({
            message: "Account created.",
            ...session,
        })
    } catch (error) {
        return res.status(500).json({
            message: "Unable to sign up right now.",
            details: error?.message || "Unknown signup error.",
        })
    }
})

// Login route.
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body || {}

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required.",
            })
        }

        const normalizedEmail = String(email).toLowerCase().trim()
        const user = await User.findOne({ email: normalizedEmail })

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password.",
            })
        }

        const passwordMatches = await bcrypt.compare(String(password), user.passwordHash)

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid email or password.",
            })
        }

        const session = await issueSession(res, user)

        return res.status(200).json({
            message: "Logged in.",
            ...session,
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Unable to log in right now.",
            details: error?.message || "Unknown login error.",
        })
    }
})

// Refresh route to restore login after page reload.
router.post("/refresh", async (req, res) => {
    try {
        const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME]

        if (!refreshToken) {
            return res.status(401).json({
                message: "No active session.",
            })
        }

        let payload

        try {
            payload = jwt.verify(refreshToken, refreshTokenSecret)
        } catch {
            return res.status(401).json({
                message: "Session expired. Please log in again.",
            })
        }

        const user = await User.findById(payload.userId)

        if (!user || !user.refreshTokenHash) {
            return res.status(401).json({
                message: "No active session.",
            })
        }

        const tokenMatches = await bcrypt.compare(refreshToken, user.refreshTokenHash)

        if (!tokenMatches) {
            return res.status(401).json({
                message: "Session expired. Please log in again.",
            })
        }

        const session = await issueSession(res, user)

        return res.status(200).json({
            message: "Session restored.",
            ...session,
        })
    } catch (error) {
        return res.status(500).json({
            message: "Unable to restore session right now.",
            details: error?.message || "Unknown refresh error.",
        })
    }
})

// Logout route clears refresh token and cookie.
router.post("/logout", async (req, res) => {
    try {
        const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME]

        if (refreshToken) {
            try {
                const payload = jwt.verify(refreshToken, refreshTokenSecret)
                const user = await User.findById(payload.userId)

                if (user) {
                    user.refreshTokenHash = ""
                    await user.save()
                }
            } catch {
                // Even if token is invalid, we still clear cookie below.
            }
        }

        res.clearCookie(REFRESH_COOKIE_NAME, {
            ...getRefreshCookieOptions(),
            maxAge: undefined,
        })

        return res.status(200).json({
            message: "Logged out.",
        })
    } catch (error) {
        return res.status(500).json({
            message: "Unable to log out right now.",
            details: error?.message || "Unknown logout error.",
        })
    }
})

module.exports = router
