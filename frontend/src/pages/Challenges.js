import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import LoadingSpinner from "../components/LoadingSpinner"
import { useAuth } from "../context/AuthContext"
import "./Challenges.css"

function Challenges() {
    const navigate = useNavigate()
    const { authAxios } = useAuth()

    // Dropdown selection state.
    const [challengeType, setChallengeType] = useState("DSA")
    const [difficulty, setDifficulty] = useState("Easy")

    // Request/response UI state.
    const [challenges, setChallenges] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    // Fetch challenges whenever selected filters change.
    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                // Reset transient UI state before each request.
                setIsLoading(true)
                setErrorMessage("")

                // Send request to backend with selected filters as query parameters
                const response = await authAxios.get("/api/challenges", {
                    params: {
                        type: challengeType,
                        difficulty,
                    },
                })

                console.log(response.data)

                // set challenges from response or empty array if response shape is unexpected.
                setChallenges(response.data?.challenges || [])
            } catch (error) {
                // display  server message when available.
                const message =
                    error.response?.data?.message ||
                    "Unable to load challenges right now. Please try again shortly."

                setChallenges([])
                setErrorMessage(message)
            } finally {
                // Ensure loading state is turned off after request completes
                setIsLoading(false)
            }
        }

        // Trigger the API request
        fetchChallenges()
    }, [authAxios, challengeType, difficulty])

    // Navigate to the solve page with the full challenge payload.
    const handleSolveChallenge = (challenge) => {
        navigate("/solve", {
            state: {
                challenge,
            },
        })
    }

    if (isLoading && challenges.length === 0) {
        return (
            <div className='page page-challenges'>
                <Navbar />
                <main className='challenges-main'>
                    <LoadingSpinner />
                </main>
            </div>
        )
    }

    return (
        <div className='page page-challenges'>
            {/* Top navigation */}
            <Navbar />

            <main className='challenges-main'>
                {/* Page heading */}
                <section className='challenges-hero'>
                    <span className='challenges-eyebrow'>Challenge hub</span>
                    <h1>Explore coding challenges by track and difficulty.</h1>
                    <p>
                        Pick a category and level to discover targeted practice built to sharpen
                        your skills.
                    </p>
                </section>

                {/* Filter controls */}
                <section className='challenge-filters-section'>
                    <div className='challenge-filters'>
                        <label className='filter-field'>
                            <span>Challenge type</span>
                            <select
                                value={challengeType}
                                onChange={(event) => setChallengeType(event.target.value)}
                                aria-label='Select challenge type'
                            >
                                <option value='DSA'>DSA</option>
                                <option value='AI'>AI</option>
                                <option value='Game Dev'>Game Dev</option>
                                <option value='Web Dev'>Web Dev</option>
                            </select>
                        </label>

                        <label className='filter-field'>
                            <span>Difficulty</span>
                            <select
                                value={difficulty}
                                onChange={(event) => setDifficulty(event.target.value)}
                                aria-label='Select challenge difficulty'
                            >
                                <option value='Easy'>Easy</option>
                                <option value='Medium'>Medium</option>
                                <option value='Hard'>Hard</option>
                            </select>
                        </label>
                    </div>
                </section>

                {/* Empty challenge state */}
                <section className='challenges-list-section'>
                    {/* Loading state */}
                    {isLoading ? <LoadingSpinner /> : null}

                    {/* Error state */}
                    {!isLoading && errorMessage ? (
                        <div className='challenges-error'>
                            <h2>Something went wrong</h2>
                            <p>{errorMessage}</p>
                        </div>
                    ) : null}

                    {/* Results state */}
                    {!isLoading && !errorMessage && challenges.length > 0 ? (
                        <div className='challenge-results-grid'>
                            {challenges.map((challenge) => (
                                <button
                                    key={challenge._id || `${challenge.title}-${challenge.type}`}
                                    type='button'
                                    className='challenge-result-card challenge-result-button'
                                    onClick={() => handleSolveChallenge(challenge)}
                                    aria-label={`Open ${challenge.title} challenge`}
                                >
                                    <div className='challenge-result-meta'>
                                        <span>{challenge.type}</span>
                                        <span>{challenge.difficulty}</span>
                                        {challenge.isCompleted ? (
                                            <span className='challenge-result-completed'>
                                                Completed
                                            </span>
                                        ) : null}
                                    </div>
                                    <h3>{challenge.title}</h3>
                                    <p>{challenge.challengeContent}</p>
                                    <span className='challenge-result-cta'>
                                        Solve this challenge
                                    </span>
                                </button>
                            ))}
                        </div>
                    ) : null}

                    {/* Empty state */}
                    {!isLoading && !errorMessage && challenges.length === 0 ? (
                        <div className='no-challenges-card'>
                            <div
                                className='no-challenges-icon'
                                aria-hidden='true'
                            >
                                <svg
                                    viewBox='0 0 24 24'
                                    role='img'
                                    focusable='false'
                                >
                                    <path d='M9 3a6 6 0 0 1 4.66 9.78l5.28 5.27-1.42 1.42-5.27-5.28A6 6 0 1 1 9 3zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8z' />
                                </svg>
                            </div>
                            <h2>No challenges yet</h2>
                            <p>
                                We could not find any challenges for the selected filters. Try a
                                different type or difficulty.
                            </p>
                        </div>
                    ) : null}
                </section>
            </main>

                    </div>
    )
}

export default Challenges


