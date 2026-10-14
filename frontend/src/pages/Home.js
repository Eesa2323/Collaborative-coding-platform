import React from "react"
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import "./Home.css"

function Home() {
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
                                Explore Learn Path
                            </Link>

                            <Link
                                to='/login'
                                className='btn btn-secondary'
                            >
                                Log In
                            </Link>
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
                            <h3>Guided practice</h3>
                            <p>
                                Solve bite-sized exercises with clear prompts and room to explore
                                different approaches.
                            </p>
                        </article>
                        <article className='feature-card'>
                            <h3>Challenge mode</h3>
                            <p>
                                Push yourself with timed problems and rank up as your skills
                                improve.
                            </p>
                        </article>
                        <article className='feature-card'>
                            <h3>Visible progress</h3>
                            <p>
                                Keep track of completed lessons, streaks, and unlocked topics in one
                                place.
                            </p>
                        </article>
                    </div>
                </section>

                {/* Call-to-action section */}
                <section className='cta-section'>
                    <div>
                        <span className='eyebrow'>Ready to start?</span>
                        <h3>Join the platform and begin your next challenge.</h3>
                    </div>

                    <div className='button-group'>
                        <Link
                            to='/signup'
                            className='btn btn-primary'
                        >
                            Create Account
                        </Link>
                    </div>
                </section>
            </main>

            {/* Site footer */}
            <Footer />
        </div>
    )
}

export default Home
