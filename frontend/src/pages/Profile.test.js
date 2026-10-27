import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useAuth } from "../context/AuthContext"
import Profile from "./Profile"

jest.mock("../context/AuthContext", () => ({ useAuth: jest.fn() }))
jest.mock("../components/Navbar", () => () => null)
jest.mock("../components/Footer", () => () => null)
jest.mock("react-chartjs-2", () => ({ Line: () => null }))

const authAxios = { get: jest.fn(), put: jest.fn() }
const updateUser = jest.fn()
const makeProfile = (overrides = {}) => ({
    name: "Learner",
    email: "learner@example.com",
    completedChallenges: [],
    ...overrides,
})

beforeEach(() => {
    jest.clearAllMocks()
    useAuth.mockReturnValue({
        user: { name: "Stale", level: 99 },
        authAxios,
        updateUser,
    })
})

test("both level displays use the fetched level instead of auth context or visible challenge count", async () => {
    authAxios.get.mockResolvedValue({ data: { user: makeProfile({ level: 4, completedChallengeCount: 12 }) } })
    render(<Profile />)

    expect(await screen.findAllByText("Level 4")).toHaveLength(2)
    expect(screen.getByText("4 challenges")).toBeInTheDocument()
})

test("missing profile level falls back to 1 even with many visible completions", async () => {
    const completedChallenges = Array.from({ length: 8 }, (_, index) => ({ id: String(index), title: `Challenge ${index}` }))
    authAxios.get.mockResolvedValue({ data: { user: makeProfile({ completedChallenges }) } })
    render(<Profile />)

    expect(await screen.findAllByText("Level 1")).toHaveLength(2)
    expect(screen.getByText("4 challenges")).toBeInTheDocument()
})

test.each([[0, "4 challenges"], [3, "1 challenge"], [4, "4 challenges"], [7, "1 challenge"], [8, "4 challenges"]])(
    "%i unique stored completions leave %s to the next milestone",
    async (count, milestone) => {
        authAxios.get.mockResolvedValue({ data: { user: makeProfile({ level: 1 + Math.floor(count / 4), completedChallengeCount: count }) } })
        render(<Profile />)

        expect(await screen.findByText(milestone)).toBeInTheDocument()
    },
)

test("legacy completion lists are deduplicated for the milestone fallback", async () => {
    const completedChallenges = ["a", "b", "a", "c", "d", "e", "f", "g"].map((id, index) => ({ id, title: `Challenge ${index}` }))
    authAxios.get.mockResolvedValue({ data: { user: makeProfile({ completedChallenges }) } })
    render(<Profile />)

    expect(await screen.findByText("1 challenge")).toBeInTheDocument()
})

test("saving profile details keeps the level returned by the profile API", async () => {
    authAxios.get.mockResolvedValue({ data: { user: makeProfile({ level: 3, completedChallengeCount: 8 }) } })
    authAxios.put.mockResolvedValue({ data: { user: makeProfile({ name: "Updated", level: 3, completedChallengeCount: 8 }) } })
    render(<Profile />)

    await screen.findByText("Learner")
    fireEvent.click(screen.getByRole("button", { name: /settings/i }))
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Updated" } })
    fireEvent.click(screen.getByRole("button", { name: "Save details" }))

    await waitFor(() => expect(screen.getByRole("heading", { name: "Updated" })).toBeInTheDocument())
    expect(screen.getAllByText("Level 3")).toHaveLength(2)
    expect(screen.getByText("4 challenges")).toBeInTheDocument()
})

