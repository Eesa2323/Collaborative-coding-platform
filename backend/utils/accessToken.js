const jwt = require("jsonwebtoken")
const config = require("config")

const getAccessTokenSecret = () => process.env.JWT_ACCESS_SECRET || config.get("jwtAccessSecret")

const verifyAccessToken = (token) => jwt.verify(token, getAccessTokenSecret())

module.exports = {
    getAccessTokenSecret,
    verifyAccessToken,
}
