const express = require("express")
const request = require("supertest")
const mongoose = require("mongoose")
const User = require("../models/User")
const userRoutes = require("../routes/users")

jest.mock("../models/User", () => ({
    findById: jest.fn(),
    populate: jest.fn(),
}))

const userId = new mongoose.Types.ObjectId()
const app = express()
app.use(express.json())
app.use((req, res, next) => {
    req.user = { userId: String(userId) }
    next()
})
app.use("/api/users", userRoutes)

const makeUser = (completedChallenges) => ({
    _id: userId,
    name: "Learner",
    email: "learner@example.com",
    completedChallenges,
    save: jest.fn().mockResolvedValue(undefined),
})

const mockProfileQuery = (user) => {
    const query = {
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(user),
    }
    User.findById.mockReturnValue(query)
    User.populate.mockImplementation(async (profile) => ({
        ...profile,
        completedChallenges: [],
    }))
}

beforeEach(() => {
    jest.clearAllMocks()
})

describe("derived profile levels", () => {
    test.each([0, 1, 3, 4, 5, 7, 8, 12])("GET counts %i stored unique completions, including deleted challenges", async (count) => {
        const ids = Array.from({ length: count }, () => new mongoose.Types.ObjectId())
        mockProfileQuery(makeUser(ids))

        const response = await request(app).get("/api/users/me")

        expect(response.status).toBe(200)
        expect(response.body.user.level).toBe(1 + Math.floor(count / 4))
        expect(response.body.user.completedChallengeCount).toBe(count)
        expect(response.body.user.completedChallenges).toEqual([])
    })

    test("GET returns populated challenge details without losing stored completion credit", async () => {
        const ids = Array.from({ length: 4 }, () => new mongoose.Types.ObjectId())
        mockProfileQuery(makeUser(ids))
        User.populate.mockImplementation(async (profile) => {
            profile.completedChallenges = [{ _id: ids[0], title: "First", type: "DSA", difficulty: "Easy" }]
            return profile
        })

        const response = await request(app).get("/api/users/me")

        expect(response.status).toBe(200)
        expect(response.body.user).toMatchObject({
            level: 2,
            completedChallengeCount: 4,
            completedChallenges: [{ id: String(ids[0]), title: "First", type: "DSA", difficulty: "Easy" }],
        })
    })

    test.each(["references", "documents", "missing"])("PUT derives level from %s and deduplicates IDs", async (input) => {
        const ids = Array.from({ length: 7 }, () => new mongoose.Types.ObjectId())
        const completions = input === "missing" ? undefined : [
            ...ids,
            new mongoose.Types.ObjectId(String(ids[0])),
        ].map((id) => input === "documents" ? { _id: id, title: "Challenge" } : id)
        User.findById.mockResolvedValue(makeUser(completions))

        const response = await request(app).put("/api/users/me").send({ name: "Updated" })

        expect(response.status).toBe(200)
        expect(response.body.user.name).toBe("Updated")
        expect(response.body.user.level).toBe(input === "missing" ? 1 : 2)
        expect(response.body.user.completedChallengeCount).toBe(input === "missing" ? 0 : 7)
    })

    test("repeated IDs do not level up, while the fourth and eighth unique IDs do", async () => {
        const ids = Array.from({ length: 8 }, () => new mongoose.Types.ObjectId())
        for (const [count, level] of [[3, 1], [4, 2], [7, 2], [8, 3]]) {
            mockProfileQuery(makeUser([...ids.slice(0, count), ids[0], ids[0]]))
            const response = await request(app).get("/api/users/me")
            expect(response.status).toBe(200)
            expect(response.body.user.level).toBe(level)
            expect(response.body.user.completedChallengeCount).toBe(count)
        }
    })
})
