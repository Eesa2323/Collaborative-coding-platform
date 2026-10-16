const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const config = require("config")
const User = require("../models/User")
const { getJwtAccessSecret, getJwtRefreshSecret } = require("../config/env")

class AuthService {
    constructor() {
        this.accessTokenSecret = getJwtAccessSecret()
        this.refreshTokenSecret = getJwtRefreshSecret()
        this.accessTokenTtl = process.env.JWT_ACCESS_TTL || config.get("accessTokenTtl")
        this.refreshTokenTtl = process.env.JWT_REFRESH_TTL || config.get("refreshTokenTtl")
    }

    /**
     * Verify access token and return payload
     * @param {string} token - JWT access token
     * @returns {Object} Token payload
     * @throws {Error} If token is invalid, expired, or malformed
     */
    verifyToken(token) {
        if (!token) {
            const error = new Error("Missing Authorization header")
            error.statusCode = 401
            throw error
        }

        if (typeof token !== "string" || token.trim().length === 0) {
            const error = new Error("Malformed token format")
            error.statusCode = 401
            throw error
        }

        try {
            const payload = jwt.verify(token, this.accessTokenSecret)
            return payload
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                const expiredError = new Error("Token expired")
                expiredError.statusCode = 401
                throw expiredError
            }
            if (error.name === "JsonWebTokenError") {
                const invalidError = new Error("Invalid token signature")
                invalidError.statusCode = 401
                throw invalidError
            }
            const err = new Error("Session expired. Please log in again.")
            err.statusCode = 401
            throw err
        }
    }

    /**
     * Create JWT access token
     * @param {Object} user - User document
     * @returns {string} JWT access token
     */
    createAccessToken(user) {
        return jwt.sign(
            {
                userId: String(user._id),
                email: user.email,
                name: user.name,
            },
            this.accessTokenSecret,
            { expiresIn: this.accessTokenTtl },
        )
    }

    /**
     * Create JWT refresh token
     * @param {Object} user - User document
     * @returns {string} JWT refresh token
     */
    createRefreshToken(user) {
        return jwt.sign(
            {
                userId: String(user._id),
            },
            this.refreshTokenSecret,
            { expiresIn: this.refreshTokenTtl },
        )
    }

    /**
     * Hash password using bcrypt
     * @param {string} password - Plain text password
     * @param {number} rounds - Bcrypt rounds (default: 10)
     * @returns {Promise<string>} Hashed password
     */
    async hashPassword(password, rounds = 10) {
        if (!password || typeof password !== "string") {
            throw new Error("Password must be a non-empty string")
        }
        return bcrypt.hash(password, rounds)
    }

    /**
     * Compare plain password with hash
     * @param {string} plainPassword - Plain text password
     * @param {string} hashedPassword - Hashed password
     * @returns {Promise<boolean>} True if passwords match
     */
    async comparePasswords(plainPassword, hashedPassword) {
        if (!plainPassword || !hashedPassword) {
            return false
        }
        return bcrypt.compare(plainPassword, hashedPassword)
    }

    /**
     * Verify refresh token and user session
     * @param {string} refreshToken - Refresh token from cookie
     * @param {Object} user - User document
     * @returns {Promise<boolean>} True if session is valid
     */
    async verifyRefreshToken(refreshToken, user) {
        if (!refreshToken || !user || !user.refreshTokenHash) {
            return false
        }

        try {
            jwt.verify(refreshToken, this.refreshTokenSecret)
            return bcrypt.compare(refreshToken, user.refreshTokenHash)
        } catch {
            return false
        }
    }

    /**
     * Return safe user fields for frontend
     * @param {Object} user - User document
     * @returns {Object} Safe user object
     */
    toSafeUser(user) {
        return {
            id: String(user._id),
            name: user.name,
            email: user.email,
        }
    }
}

module.exports = new AuthService()
