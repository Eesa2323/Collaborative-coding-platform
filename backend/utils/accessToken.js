const jwt = require("jsonwebtoken")
const { getJwtAccessSecret } = require("../config/env")

const getAccessTokenSecret = () => getJwtAccessSecret()

const verifyAccessToken = (token) => jwt.verify(token, getAccessTokenSecret())

module.exports = {
    getAccessTokenSecret,
    verifyAccessToken,
}
