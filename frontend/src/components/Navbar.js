import React from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import "./Navbar.css"

const ICON_PATHS = {
    search: "M10 2a8 8 0 0 1 6.32 12.9l5.39 5.39-1.42 1.42-5.39-5.39A8 8 0 1 1 10 2zm0 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12z",
    learn: "M12 3 1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z",
    challenges: "M8.7 7.3 3.4 12l5.3 4.7-1.4 1.6L.6 12l6.7-5.9 1.4 1.2zm6.6 0 1.4-1.2 6.7 5.9-6.7 5.9-1.4-1.6 5.3-4.7-5.3-4.7zM13.1 4l1.9.5-4.1 16-1.9-.5L13.1 4z",
    collaborate: "M16 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3zM8 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05A4.2 4.2 0 0 1 17 16.5V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
    community: "M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
    features: "m12 2 2.9 6.9 7.1.6-5.4 4.7 1.7 7.3L12 17.8 5.7 21.5l1.7-7.3L2 9.5l7.1-.6L12 2z",
    bell: "M12 2a7 7 0 0 0-7 7v3.59L3.29 14.3A1 1 0 0 0 4 16h16a1 1 0 0 0 .71-1.7L19 12.59V9a7 7 0 0 0-7-7zm0 20a3 3 0 0 0 2.83-2H9.17A3 3 0 0 0 12 22z",
    login: "M10 17v-3H3v-4h7V7l5 5-5 5zm4-14h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6v-2h6V5h-6V3z",
}

function NavIcon({ name }) {
    return (
        <svg
            className='nav-icon'
            viewBox='0 0 24 24'
            aria-hidden='true'
            focusable='false'
        >
            <path d={ICON_PATHS[name]} />
        </svg>
    )
}

const NAV_ITEMS = [
    { to: "/search", label: "Search", icon: "search" },
    { to: "/learn", label: "Learn", icon: "learn" },
    { to: "/challenges", label: "Challenges", icon: "challenges" },
    { to: "/collaborate", label: "Collaborate", icon: "collaborate" },
    { to: "/communities", label: "Community", icon: "community" },
]

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const { status, user, authAxios } = useAuth()

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
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => (isActive ? "nav-item is-active" : "nav-item")}
                        >
                            <NavIcon name={item.icon} />
                            <span className='nav-label'>{item.label}</span>
                        </NavLink>
                    ))}
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
                            className='nav-link nav-action-button nav-item'
                        >
                            <NavIcon name='login' />
                            <span className='nav-label'>Log In</span>
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
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={closeMenu}
                            className={({ isActive }) => (isActive ? "nav-item is-active" : "nav-item")}
                        >
                            <NavIcon name={item.icon} />
                            <span className='nav-label'>{item.label}</span>
                        </NavLink>
                    ))}
                    <Link
                        to='/#features'
                        onClick={closeMenu}
                        className='nav-item'
                    >
                        <NavIcon name='features' />
                        <span className='nav-label'>Features</span>
                    </Link>
                    {isAuthenticated ? (
                        <>
                            <NavLink
                                to='/notifications'
                                onClick={closeMenu}
                                className={({ isActive }) => (isActive ? "nav-item is-active" : "nav-item")}
                            >
                                <NavIcon name='bell' />
                                <span className='nav-label'>Notifications</span>
                                {unreadCount > 0 ? (
                                    <span className='nav-mobile-badge'>{unreadCount}</span>
                                ) : null}
                            </NavLink>
                            <NavLink
                                to={user?.id ? `/profile/${user.id}` : "/profile"}
                                onClick={closeMenu}
                                className={({ isActive }) => (isActive ? "nav-item is-active" : "nav-item")}
                            >
                                <span className='nav-user-avatar'>
                                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                                </span>
                                <span className='nav-label'>{userDisplayName}</span>
                            </NavLink>
                        </>
                    ) : (
                        <Link
                            to='/login'
                            className='nav-link nav-action-button nav-item'
                            onClick={closeMenu}
                        >
                            <NavIcon name='login' />
                            <span className='nav-label'>Log In</span>
                        </Link>
                    )}
                </div>
            ) : null}
        </header>
    )
}

export default Navbar

