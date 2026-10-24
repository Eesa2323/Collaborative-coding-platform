const requiredEnv = (name) => {
    const value = process.env[name]?.trim()

    if (!value || value.includes("<") || value.includes("replace-with")) {
        console.error(`\nPlease add your own ${name} to backend/.env. See .env.example and README for guidance.\n`)
        process.exit(1)
    }

    return value
}

module.exports = {
    getMongoDbUri: () => requiredEnv("MONGODB_URI"),
    getJwtAccessSecret: () => requiredEnv("JWT_ACCESS_SECRET"),
    getJwtRefreshSecret: () => requiredEnv("JWT_REFRESH_SECRET"),
}
