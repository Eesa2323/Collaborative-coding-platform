import React from "react"
import { Link } from "react-router-dom"
import "./Footer.css"

function Footer() {
    return (
        <footer className='footer'>
            {/* Brand and description */}
            <div>
                <span className='footer-brand'>CodeCraft</span>
                <p>
                    A focused place to learn coding, practice consistently, and grow through
                    challenge-based learning.
                </p>
            </div>

            {/* Quick navigation links */}
            <div
                className='footer-links'
                id='community'
            >
                <Link to='/challenges'>Challenges</Link>
                <Link to='/login'>Log In</Link>
                <Link to='/signup'>Sign Up</Link>
            </div>
        </footer>
    )
}

export default Footer
