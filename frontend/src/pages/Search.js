import React, { useEffect, useState, useRef, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import LoadingSpinner from "../components/LoadingSpinner"
import { useAuth } from "../context/AuthContext"
import "./Search.css"

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "https://collaborative-coding-platform-pvdr.onrender.com"

function Search() {
    const { status, user, authAxios } = useAuth()
    const isAuthenticated = status === "authenticated"
    const navigate = useNavigate()

    const [query, setQuery] = useState("")
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [recentSearches, setRecentSearches] = useState([])
    const [recentLoading, setRecentLoading] = useState(false)

    const debounceRef = useRef(null)

    // Fetch recent searches from backend
    useEffect(() => {
        if (!isAuthenticated || !user?.id) return

        const fetchRecent = async () => {
            setRecentLoading(true)
            try {
                const response = await authAxios.get(`/api/users/${user.id}`, {
                    withCredentials: true,
                })
                const recent = response.data?.user?.recentHistory || []
                setRecentSearches(recent)
            } catch (err) {
                console.error("Error fetching recent searches:", err)
            } finally {
                setRecentLoading(false)
            }
        }
        fetchRecent()
    }, [isAuthenticated, user?.id, authAxios])

    // Debounced search
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current)
        }

        if (!query.trim()) {
            setResults([])
            setError("")
            setLoading(false)
            return
        }

        setResults([])
        setLoading(true)
        debounceRef.current = setTimeout(async () => {
            setLoading(true)
            setError("")
            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/public/search?q=${encodeURIComponent(query.trim())}`
                )
                if (!response.ok) throw new Error("Search failed")
                const data = await response.json()
                setResults(data.users || [])
            } catch (err) {
                setError("Search is unavailable right now.")
                setResults([])
            } finally {
                setLoading(false)
            }
        }, 800)

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current)
            }
        }
    }, [query])

    const handleUserClick = useCallback(
        async (clickedUser) => {
            // Update local state
            setRecentSearches((prev) => {
                const filtered = prev.filter((u) => String(u.id || u._id || u) !== String(clickedUser.id))
                return [clickedUser, ...filtered].slice(0, 16)
            })

            // Update backend recentHistory if authenticated
            if (isAuthenticated && user?.id) {
                try {
                    await authAxios.put(
                        `/api/users/${clickedUser.id}/recent`,
                        {},
                        { withCredentials: true }
                    )
                } catch (err) {
                    console.error("Error updating recent history:", err)
                }
            }

            navigate(`/profile/${clickedUser.id}`)
        },
        [isAuthenticated, user?.id, authAxios, navigate]
    )

    const displayList = query.trim() ? results : recentSearches
    const showNoResults = query.trim() && !loading && results.length === 0 && !error

    return (
        <div className='page page-search'>
            <Navbar />
            <main className='search-main'>
                <section className='search-section'>
                    <div className='section-heading'>
                        <span className='eyebrow'>Find people</span>
                        <h2>Search users</h2>
                    </div>

                    <div className='search-input-group'>
                        <input
                            type='text'
                            placeholder='Search by name or email...'
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {loading && (
                        <div className='search-status'>
                            <LoadingSpinner label='' />
                        </div>
                    )}
                    {error && <p className='search-status search-error'>{error}</p>}
                    {showNoResults && (
                        <p className='search-status'>No users found matching "{query}"</p>
                    )}

                    {!query.trim() && recentLoading && (
                        <div className='search-status'>
                            <LoadingSpinner />
                        </div>
                    )}
                        <div className='search-recent'>
                            <h3>Recent searches</h3>
                        </div>
                    )}

                    <div className='search-results'>
                        {displayList.map((u) => (
                            <div
                                key={u.id || u._id}
                                className='search-result-item'
                                onClick={() => handleUserClick(u)}
                            >
                                <div className='search-result-avatar'>
                                    {(u.name || u.email || "?").charAt(0).toUpperCase()}
                                </div>
                                <div className='search-result-info'>
                                    <h4>{u.name || "Anonymous"}</h4>
                                    <p>{u.email}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {!query.trim() && recentSearches.length === 0 && !recentLoading && (
                        <p className='search-status'>
                            {isAuthenticated
                                ? "No recent searches yet."
                                : "Log in to see recent searches."}
                        </p>
                    )}
                </section>
            </main>
                    </div>
    )
}

export default Search


