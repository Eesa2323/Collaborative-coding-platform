import React from "react"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import "./Navbar.css"

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const { status, user, logout, authAxios } = useAuth()

    // Show user name when logged in, otherwise keep login link.
    const isAuthenticated = status === "authenticated"
    const userDisplayName = user?.name || user?.email || "User"

    const closeMenu = () => setMenuOpen(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (!isAuthenticated) {
            setUnreadCount(0)
            return
        }

        let isMounted = true

        const fetchUnreadCount = async () => {
            try {
                const response = await authAxios.get("/api/notifications")
                const nextUnreadCount = Number(response.data?.unreadCount || 0)

                if (isMounted) {
                    setUnreadCount(nextUnreadCount)
                }
            } catch {
                if (isMounted) {
                    setUnreadCount(0)
                }
            }
        }

        fetchUnreadCount()

        return () => {
            isMounted = false
        }
    }, [authAxios, isAuthenticated])

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true)
            await logout()
        } finally {
            setIsLoggingOut(false)
            closeMenu()
        }
    }

    return (
        <header className='site-navbar'>
            <div className='site-navbar__inner'>
                {/* Brand */}
                <div
                    onClick={() => navigate("/")}
                    className='navbar-brand'
                >
                    <span className='brand-mark'>C</span>
                    <div>
                        <span className='brand-name'>CodeCraft</span>
                        <span className='brand-tagline'>Learn by building</span>
                    </div>
                </div>

                {/* Desktop navigation links */}
                <nav
                    className='navbar-links'
                    aria-label='Primary navigation'
                >
                    <Link to='/search'>Search</Link>
                    <Link to='/learn'>Learn</Link>
                    <Link to='/challenges'>Challenges</Link>
                    <Link to='/collaborate'>Collaborate</Link>
                    <Link to='/communities'>Community</Link>
                </nav>

                {/* Desktop auth actions */}
                <div className='navbar-actions'>
                    {isAuthenticated ? (
                        <>
                            <Link
                                to='/notifications'
                                className='nav-notification-link'
                                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
                                title='Notifications'
                            >
                                <span
                                    className='nav-notification-icon'
                                    aria-hidden='true'
                                >
                                    <svg
                                        viewBox='0 0 24 24'
                                        role='img'
                                        focusable='false'
                                    >
                                        <path d='M12 2a7 7 0 0 0-7 7v3.59L3.29 14.3A1 1 0 0 0 4 16h16a1 1 0 0 0 .71-1.7L19 12.59V9a7 7 0 0 0-7-7zm0 20a3 3 0 0 0 2.83-2H9.17A3 3 0 0 0 12 22z' />
                                    </svg>
                                </span>
                                {unreadCount > 0 ? (
                                    <span className='nav-notification-badge'>{unreadCount}</span>
                                ) : null}
                            </Link>
                            <Link
                                to={user?.id ? `/profile/${user.id}` : "/profile"}
                                className='nav-user-name'
                            >
                                <span className='nav-user-avatar'>
                                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                                </span>
                                {userDisplayName}
                            </Link>
                        </>
                    ) : null}
                    {!isAuthenticated ? (
                        <Link
                            to='/login'
                            className='nav-link nav-action-button'
                        >
                            Log In
                        </Link>
                    ) : null}
                </div>

                {/* Mobile menu toggle */}
                <button
                    type='button'
                    className='navbar-toggle'
                    aria-label='Toggle navigation menu'
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((current) => !current)}
                >
                    <span />
                    <span />
                    <span />
                </button>
            </div>

            {menuOpen ? (
                <div className='navbar-mobile-menu'>
                    {/* Mobile navigation drawer */}
                    {/* Mobile menu uses the same navigation targets as desktop. */}
                    <Link
                        to='/search'
                        onClick={closeMenu}
                    >
                        Search
                    </Link>
                    <Link
                        to='/#features'
                        onClick={closeMenu}
                    >
                        Features
                    </Link>
                    <Link
                        to='/challenges'
                        onClick={closeMenu}
                    >
                        Challenges
                    </Link>
                    <Link
                        to='/learn'
                        onClick={closeMenu}
                    >
                        Learn
                    </Link>
                    <Link
                        to='/collaborate'
                        onClick={closeMenu}
                    >
                        Collaborate
                    </Link>
                    {isAuthenticated ? (
                        <Link
                            to='/notifications'
                            onClick={closeMenu}
                        >
                            Notifications
                        </Link>
                    ) : null}
                    <Link
                        to='/communities'
                        onClick={closeMenu}
                    >
                        Community
                    </Link>
                    {isAuthenticated ? (
                        <Link
                            to={user?.id ? `/profile/${user.id}` : "/profile"}
                            onClick={closeMenu}
                        >
                            {userDisplayName}
                        </Link>
                    ) : (
                        <Link
                            to='/login'
                            className='nav-link nav-action-button'
                            onClick={closeMenu}
                        >
                            Log In
                        </Link>
                    )}
                </div>
            ) : null}
        </header>
    )
}

export default Navbar

