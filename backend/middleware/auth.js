const { verifyAccessToken } = require("../utils/accessToken")

// This middleware checks the access token from the Authorization header.
module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization || ""

    // Header should look like: Bearer <token>
    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Login required.",
        })
    }

    const token = authHeader.slice(7)

    try {
        // Verify token and put user info on the request.
        const payload = verifyAccessToken(token)
        req.user = payload
        return next()
    } catch {
        // If token is bad or expired, ask user to login again.
        return res.status(401).json({
            message: "Session expired. Please log in again.",
        })
    }
}
