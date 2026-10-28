import { render, screen } from "@testing-library/react"
import App from "./App"

test("renders the home hero copy", () => {
    render(<App />)
    expect(screen.getByText(/build skills by solving real coding challenges/i)).toBeInTheDocument()
})

