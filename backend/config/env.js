const requiredEnv = (name) => {
    const value = process.env[name]?.trim()

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`)
    }

    return value
}

module.exports = {
    getMongoDbUri: () => requiredEnv("MONGODB_URI"),
    getJwtAccessSecret: () => requiredEnv("JWT_ACCESS_SECRET"),
    getJwtRefreshSecret: () => requiredEnv("JWT_REFRESH_SECRET"),
}
