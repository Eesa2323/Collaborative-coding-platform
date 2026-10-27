import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import Navbar from "../components/Navbar"
import { useAuth } from "../context/AuthContext"
import "./Home.css"

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"

function Home() {
    const { status } = useAuth()
    const isAuthenticated = status === "authenticated"
    const [leaderboard, setLeaderboard] = useState([])
    const [leaderboardLoading, setLeaderboardLoading] = useState(true)
    const [leaderboardError, setLeaderboardError] = useState("")

    useEffect(() => {
        let isMounted = true

        const fetchLeaderboard = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/public/leaderboard`)
                if (isMounted) {
                    setLeaderboard(response.data?.users || [])
                }
            } catch (err) {
                if (isMounted) {
                    setLeaderboardError("Leaderboard is unavailable right now.")
                }
            } finally {
                if (isMounted) {
                    setLeaderboardLoading(false)
                }
            }
        }

        fetchLeaderboard()

        return () => {
            isMounted = false
        }
    }, [])

    return (
        <div className='page page-home'>
            {/* Top navigation */}
            <Navbar />

            <main className='home-main'>
                {/* Hero section */}
                <section className='hero-section'>
                    <div className='hero-copy'>
                        <span className='eyebrow'>Interactive coding platform</span>
                        <h1 className='hero-title'>
                            Build skills by solving real coding challenges.
                        </h1>
                        <p className='hero-text'>
                            Learn, practice, and compete in a focused environment built for
                            developers who want to level up with hands-on challenges.
                        </p>

                        <div className='button-group'>
                            <Link
                                to='/learn'
                                className='btn btn-primary'
                            >
                                Explore Learning Paths
                            </Link>

                            {!isAuthenticated && (
                                <Link
                                    to='/login'
                                    className='btn btn-secondary'
                                >
                                    Log In
                                </Link>
                            )}
                        </div>

                        <div
                            className='hero-stats'
                            aria-label='Platform highlights'
                        >
                            <div className='stat-card'>
                                <strong>100+</strong>
                                <span>Practice challenges</span>
                            </div>
                            <div className='stat-card'>
                                <strong>Live</strong>
                                <span>Instant feedback loops</span>
                            </div>
                            <div className='stat-card'>
                                <strong>Grow</strong>
                                <span>Track your progress</span>
                            </div>
                        </div>
                    </div>

                    <div className='hero-panel'>
                        {/* Quick overview card for new visitors. */}
                        <div className='code-window'>
                            <div className='code-window-bar'>
                                <span />
                                <span />
                                <span />
                            </div>
                            <pre>
                                {`function solve() {
  const skills = ["learn", "build", "compete"]
  return skills.join(" -> ")
}`}
                            </pre>
                        </div>
                    </div>
                </section>

                {/* Core features section */}
                <section
                    className='feature-section'
                    id='features'
                >
                    <div className='section-heading'>
                        <span className='eyebrow'>Why CodeCraft</span>
                        <h2>Everything you need to learn by doing.</h2>
                    </div>

                    <div className='feature-grid'>
                        <article className='feature-card'>
                            <h3>Monaco code editor</h3>
                            <p>
                                Write and run JavaScript, Python, Java, or C# right in the browser.
                            </p>
                        </article>
                        <article className='feature-card'>
                            <h3>Judge0 execution</h3>
                            <p>
                                Submissions run on a configurable Judge0 runtime with instant
                                results.
                            </p>
                            <Link
                                to={isAuthenticated ? "/challenges" : "/login"}
                                className='btn btn-secondary btn-small feature-card-link'
                            >
                                Go to Challenges
                            </Link>
                        </article>
                        <article className='feature-card'>
                            <h3>Live collaboration</h3>
                            <p>
                                Invite others into a shared coding session with real-time Socket.IO
                                sync.
                            </p>
                            <Link
                                to={isAuthenticated ? "/collaborate" : "/login"}
                                className='btn btn-secondary btn-small feature-card-link'
                            >
                                Go to Collaboration
                            </Link>
                        </article>
                        <article className='feature-card'>
                            <h3>Progress tracking</h3>
                            <p>
                                Completed challenges are tracked automatically so you can watch your
                                level grow.
                            </p>
                        </article>
                        <article className='feature-card'>
                            <h3>Communities</h3>
                            <p>
                                Create or join communities and share image-enabled posts with other
                                learners.
                            </p>
                            <Link
                                to={isAuthenticated ? "/communities" : "/login"}
                                className='btn btn-secondary btn-small feature-card-link'
                            >
                                Go to Communities
                            </Link>
                        </article>
                        <article className='feature-card'>
                            <h3>Notifications</h3>
                            <p>Stay in the loop on collaboration invites and community activity.</p>
                        </article>
                    </div>
                </section>

                {/* Leaderboard section */}
                <section className='leaderboard-section'>
                    <div className='section-heading'>
                        <span className='eyebrow'>Top performers</span>
                        <h2>Leaderboard</h2>
                    </div>

                    {leaderboardLoading && (
                        <p className='leaderboard-status'>Loading leaderboard...</p>
                    )}

                    {!leaderboardLoading && leaderboardError && (
                        <p className='leaderboard-status'>{leaderboardError}</p>
                    )}

                    {!leaderboardLoading && !leaderboardError && leaderboard.length === 0 && (
                        <p className='leaderboard-status'>
                            No challenge completions yet. Be the first to climb the leaderboard!
                        </p>
                    )}

                    {!leaderboardLoading && !leaderboardError && leaderboard.length > 0 && (
                        <table className='leaderboard-table'>
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Name</th>
                                    <th>Level</th>
                                    <th>Challenges solved</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((entry, index) => (
                                    <tr key={entry.id}>
                                        <td>#{index + 1}</td>
                                        <td>
                                            <Link
                                                to={`/profile/${entry.id}`}
                                                className='leaderboard-user-link'
                                            >
                                                {entry.name}
                                            </Link>
                                        </td>
                                        <td>{`Level ${entry.level}`}</td>
                                        <td>{entry.completedCount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>

                {/* Call-to-action section */}
                <section className='cta-section'>
                    <div>
                        <span className='eyebrow'>Ready to start?</span>
                        <h3>
                            {isAuthenticated
                                ? "Jump back in and tackle your next challenge."
                                : "Join the platform and begin your next challenge."}
                        </h3>
                    </div>

                    <div className='button-group'>
                        {isAuthenticated ? (
                            <Link
                                to='/challenges'
                                className='btn btn-primary'
                            >
                                Go to Challenges
                            </Link>
                        ) : (
                            <Link
                                to='/signup'
                                className='btn btn-primary'
                            >
                                Create Account
                            </Link>
                        )}
                    </div>
                </section>
            </main>

                    </div>
    )
}

export default Home



