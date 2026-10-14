const AuthService = require("../../services/AuthService")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

describe("AuthService - verifyToken", () => {
    const secret = process.env.JWT_ACCESS_SECRET || "test-secret"

    it("should verify valid token and return payload", () => {
        const payload = { userId: "123", email: "test@example.com", name: "Test User" }
        const token = jwt.sign(payload, secret, { expiresIn: "1h" })

        const result = AuthService.verifyToken(token)

        expect(result.userId).toBe("123")
        expect(result.email).toBe("test@example.com")
    })

    it("should throw error for missing token", () => {
        expect(() => AuthService.verifyToken(null)).toThrow("Missing Authorization header")
    })

    it("should throw error for empty token", () => {
        expect(() => AuthService.verifyToken("")).toThrow("Missing Authorization header")
    })

    it("should throw error for whitespace-only token", () => {
        expect(() => AuthService.verifyToken("   ")).toThrow("Missing Authorization header")
    })

    it("should throw error for malformed token (non-string)", () => {
        expect(() => AuthService.verifyToken({})).toThrow("Malformed token format")
    })

    it("should throw error for invalid token signature", () => {
        const token = jwt.sign({ userId: "123" }, "wrong-secret", { expiresIn: "1h" })

        expect(() => AuthService.verifyToken(token)).toThrow("Invalid token signature")
    })

    it("should throw error for expired token", (done) => {
        const token = jwt.sign({ userId: "123" }, secret, { expiresIn: "0s" })

        // Wait for token to expire
        setTimeout(() => {
            expect(() => AuthService.verifyToken(token)).toThrow("Token expired")
            done()
        }, 100)
    })

    it("should throw error for invalid token format", () => {
        expect(() => AuthService.verifyToken("not.a.valid.jwt")).toThrow()
    })
})

describe("AuthService - createAccessToken", () => {
    it("should create valid JWT access token", () => {
        const user = { _id: "user123", email: "test@example.com", name: "Test User" }

        const token = AuthService.createAccessToken(user)

        expect(token).toBeDefined()
        expect(typeof token).toBe("string")

        // Verify it's a valid JWT
        const decoded = jwt.decode(token)
        expect(decoded.userId).toBe("user123")
        expect(decoded.email).toBe("test@example.com")
    })

    it("should include user info in token payload", () => {
        const user = { _id: "456", email: "user@test.com", name: "John Doe" }

        const token = AuthService.createAccessToken(user)
        const decoded = jwt.decode(token)

        expect(decoded).toHaveProperty("userId")
        expect(decoded).toHaveProperty("email")
        expect(decoded).toHaveProperty("name")
        expect(decoded.name).toBe("John Doe")
    })
})

describe("AuthService - createRefreshToken", () => {
    it("should create valid JWT refresh token", () => {
        const user = { _id: "user789" }

        const token = AuthService.createRefreshToken(user)

        expect(token).toBeDefined()
        expect(typeof token).toBe("string")

        const decoded = jwt.decode(token)
        expect(decoded.userId).toBe("user789")
    })

    it("should only include userId in refresh token", () => {
        const user = { _id: "abc123", email: "test@example.com", name: "User" }

        const token = AuthService.createRefreshToken(user)
        const decoded = jwt.decode(token)

        expect(Object.keys(decoded)).toContain("userId")
        expect(decoded.email).toBeUndefined()
        expect(decoded.name).toBeUndefined()
    })
})

describe("AuthService - hashPassword", () => {
    it("should hash password using bcrypt", async () => {
        const password = "testPassword123"

        const hash = await AuthService.hashPassword(password)

        expect(hash).toBeDefined()
        expect(typeof hash).toBe("string")
        expect(hash).not.toBe(password)
        expect(hash.length).toBeGreaterThan(0)
    })

    it("should create different hashes for same password", async () => {
        const password = "testPassword123"

        const hash1 = await AuthService.hashPassword(password)
        const hash2 = await AuthService.hashPassword(password)

        expect(hash1).not.toBe(hash2)
    })

    it("should throw error for empty password", async () => {
        await expect(AuthService.hashPassword("")).rejects.toThrow()
    })

    it("should throw error for null password", async () => {
        await expect(AuthService.hashPassword(null)).rejects.toThrow()
    })

    it("should throw error for non-string password", async () => {
        await expect(AuthService.hashPassword(123)).rejects.toThrow()
    })

    it("should use custom bcrypt rounds if provided", async () => {
        const password = "testPassword123"

        const hash = await AuthService.hashPassword(password, 5)

        expect(hash).toBeDefined()
        const isValid = await bcrypt.compare(password, hash)
        expect(isValid).toBe(true)
    })
})

describe("AuthService - comparePasswords", () => {
    it("should return true for matching password", async () => {
        const password = "myPassword123"
        const hash = await bcrypt.hash(password, 10)

        const result = await AuthService.comparePasswords(password, hash)

        expect(result).toBe(true)
    })

    it("should return false for non-matching password", async () => {
        const password = "myPassword123"
        const wrongPassword = "wrongPassword123"
        const hash = await bcrypt.hash(password, 10)

        const result = await AuthService.comparePasswords(wrongPassword, hash)

        expect(result).toBe(false)
    })

    it("should return false for null passwords", async () => {
        const hash = await bcrypt.hash("password", 10)

        const result1 = await AuthService.comparePasswords(null, hash)
        const result2 = await AuthService.comparePasswords("password", null)

        expect(result1).toBe(false)
        expect(result2).toBe(false)
    })

    it("should return false for empty string password", async () => {
        const hash = await bcrypt.hash("password", 10)

        const result = await AuthService.comparePasswords("", hash)

        expect(result).toBe(false)
    })

    it("should catch bcrypt comparison bug (strict equality)", async () => {
        // This test ensures the fix for the bcrypt comparison bug
        const password = "securePassword123"
        const hash = await bcrypt.hash(password, 10)

        // Using strict equality (===) would always return false
        // Our implementation uses bcrypt.compare()
        const result = await AuthService.comparePasswords(password, hash)

        expect(result).toBe(true)
    })
})

describe("AuthService - verifyRefreshToken", () => {
    it("should return true for valid refresh token and matching hash", async () => {
        const refreshToken = jwt.sign(
            { userId: "user1" },
            process.env.JWT_REFRESH_SECRET || "refresh-secret",
        )
        const hash = await bcrypt.hash(refreshToken, 10)

        const user = {
            _id: "user1",
            refreshTokenHash: hash,
        }

        const result = await AuthService.verifyRefreshToken(refreshToken, user)

        expect(result).toBe(true)
    })

    it("should return false for invalid refresh token", async () => {
        const user = {
            _id: "user1",
            refreshTokenHash: await bcrypt.hash("valid-token", 10),
        }

        const result = await AuthService.verifyRefreshToken("wrong-token", user)

        expect(result).toBe(false)
    })

    it("should return false for null refresh token", async () => {
        const user = {
            _id: "user1",
            refreshTokenHash: "some-hash",
        }

        const result = await AuthService.verifyRefreshToken(null, user)

        expect(result).toBe(false)
    })

    it("should return false for null user", async () => {
        const result = await AuthService.verifyRefreshToken("token", null)

        expect(result).toBe(false)
    })

    it("should return false if user has no refreshTokenHash", async () => {
        const user = {
            _id: "user1",
            refreshTokenHash: null,
        }

        const result = await AuthService.verifyRefreshToken("token", user)

        expect(result).toBe(false)
    })
})

describe("AuthService - toSafeUser", () => {
    it("should return safe user object with id, name, email", () => {
        const user = {
            _id: "user123",
            name: "John Doe",
            email: "john@example.com",
            passwordHash: "secret-hash",
            refreshTokenHash: "refresh-hash",
        }

        const safeUser = AuthService.toSafeUser(user)

        expect(safeUser).toHaveProperty("id", "user123")
        expect(safeUser).toHaveProperty("name", "John Doe")
        expect(safeUser).toHaveProperty("email", "john@example.com")
    })

    it("should not include sensitive fields in safe user", () => {
        const user = {
            _id: "user123",
            name: "Jane",
            email: "jane@example.com",
            passwordHash: "secret",
            refreshTokenHash: "refresh",
        }

        const safeUser = AuthService.toSafeUser(user)

        expect(safeUser).not.toHaveProperty("passwordHash")
        expect(safeUser).not.toHaveProperty("refreshTokenHash")
        expect(safeUser).not.toHaveProperty("_id")
    })

    it("should convert _id to id string", () => {
        const user = {
            _id: { toString: () => "objectid123" },
            name: "User",
            email: "user@test.com",
        }

        const safeUser = AuthService.toSafeUser(user)

        expect(typeof safeUser.id).toBe("string")
    })
})
