import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import Modal from "../components/Modal"
import LoadingSpinner from "../components/LoadingSpinner"
import "./Communities.css"

// Communities component - displays list of communities, allows creation and search for authenticated users
export default function Communities() {
    const { authAxios, status } = useAuth()
    const navigate = useNavigate()

    // State variables for communities data and UI management
    const [communities, setCommunities] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [successMessage, setSuccessMessage] = useState("")

    // Modal states for create and search modals
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showSearchModal, setShowSearchModal] = useState(false)

    // Create community form data
    const [createData, setCreateData] = useState({ title: "", description: "" })
    const [createError, setCreateError] = useState("")
    const [createLoading, setCreateLoading] = useState(false)

    // Search functionality state
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const [searchLoading, setSearchLoading] = useState(false)

    const isAuthenticated = status === "authenticated"

    // Fetch communities on component mount
    useEffect(() => {
        fetchCommunities()
    }, [])

    // Function to fetch all communities from the API
    const fetchCommunities = async () => {
        try {
            setLoading(true)
            setError("")
            const response = await authAxios.get("/api/communities", {
                withCredentials: true,
            })

            if (response.data?.communities) {
                setCommunities(response.data.communities)
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load communities")
            console.error("Error fetching communities:", err)
        } finally {
            setLoading(false)
        }
    }

    // Handle community creation form submission
    const handleCreateCommunity = async (e) => {
        e.preventDefault()
        setCreateError("")

        // Validate required fields
        if (!createData.title.trim() || !createData.description.trim()) {
            setCreateError("Title and description are required.")
            return
        }

        // Validate title length (max 100 characters)
        if (createData.title.length > 100) {
            setCreateError("Title must be 100 characters or less.")
            return
        }

        // Validate description length (max 500 characters)
        if (createData.description.length > 500) {
            setCreateError("Description must be 500 characters or less.")
            return
        }

        try {
            setCreateLoading(true)
            const response = await authAxios.post(
                "/api/communities",
                {
                    title: createData.title,
                    description: createData.description,
                },
                { withCredentials: true },
            )

            if (response.data?.community) {
                // Add new community to the beginning of the list
                setCommunities([response.data.community, ...communities])
                setSuccessMessage("Community created successfully!")
                setShowCreateModal(false)
                setCreateData({ title: "", description: "" })
                setTimeout(() => setSuccessMessage(""), 3000)
            }
        } catch (err) {
            setCreateError(err.response?.data?.message || "Failed to create community")
            console.error("Error creating community:", err)
        } finally {
            setCreateLoading(false)
        }
    }

    // Handle search input changes with debouncing effect
    const handleSearch = async (query) => {
        setSearchQuery(query)

        // Clear results if query is empty
        if (!query.trim()) {
            setSearchResults([])
            return
        }

        try {
            setSearchLoading(true)
            const response = await authAxios.get("/api/communities/search", {
                params: { q: query },
                withCredentials: true,
            })

            if (response.data?.communities) {
                setSearchResults(response.data.communities)
            }
        } catch (err) {
            console.error("Error searching communities:", err)
            setSearchResults([])
        } finally {
            setSearchLoading(false)
        }
    }

    // Handle joining a community and navigating to its detail page
    const handleJoinAndNavigate = async (communityId) => {
        if (!isAuthenticated) {
            navigate("/login")
            return
        }

        try {
            // Attempt to join the community (idempotent - 400 if already a member)
            await authAxios.post(
                `/api/communities/${communityId}/join`,
                {},
                { withCredentials: true },
            )
        } catch (err) {
            // 400 status means already a member, which is fine
            if (err.response?.status !== 400) {
                console.error("Error joining community:", err)
            }
        }

        // Navigate to community detail page regardless of join status
        navigate(`/communities/${communityId}`)
    }

    // Show loading spinner while fetching data
    if (loading) {
        return (
            <div className='page-communities'>
                <Navbar />
                <LoadingSpinner />
                <Footer />
            </div>
        )
    }

    // Main render
    return (
        <div className='page-communities'>
            <Navbar />

            <div className='communities-container'>
                {error && <div className='page-error-message'>{error}</div>}
                {successMessage && <div className='page-success-message'>{successMessage}</div>}

                <div className='communities-header'>
                    <h1>Community</h1>
                    <p>Connect, collaborate, and learn together</p>
                </div>

                {isAuthenticated && (
                    <div className='communities-actions'>
                        <button
                            className='action-btn action-btn-create'
                            onClick={() => setShowCreateModal(true)}
                        >
                            + Create Community
                        </button>
                        <button
                            className='action-btn action-btn-search'
                            onClick={() => setShowSearchModal(true)}
                        >
                            🔍 Search Communities
                        </button>
                    </div>
                )}

                {communities.length === 0 ? (
                    <div className='no-communities-message'>
                        <h2>No communities yet</h2>
                        <p>Be the first to create one and start connecting!</p>
                        {isAuthenticated ? (
                            <button
                                className='action-btn action-btn-create'
                                onClick={() => setShowCreateModal(true)}
                            >
                                Create Your First Community
                            </button>
                        ) : (
                            <button
                                className='action-btn action-btn-create'
                                onClick={() => navigate("/login")}
                            >
                                Sign In to Create a Community
                            </button>
                        )}
                    </div>
                ) : (
                    <div className='communities-grid'>
                        {communities.map((community) => (
                            <div
                                key={community.id}
                                className='community-card'
                            >
                                <div className='community-card-header'>
                                    <h3>{community.title}</h3>
                                    <span className='community-creator'>
                                        by {community.creator.name}
                                    </span>
                                </div>
                                <p className='community-description'>{community.description}</p>
                                <div className='community-stats'>
                                    <span>
                                        {community.memberCount} member
                                        {community.memberCount !== 1 ? "s" : ""}
                                    </span>
                                    <span>•</span>
                                    <span>
                                        {community.postCount} post
                                        {community.postCount !== 1 ? "s" : ""}
                                    </span>
                                </div>
                                <button
                                    className='community-enter-btn'
                                    onClick={() => handleJoinAndNavigate(community.id)}
                                >
                                    Enter Community
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isAuthenticated && (
                <>
                    {showCreateModal && (
                        <Modal
                            title='Create Community'
                            onClose={() => setShowCreateModal(false)}
                        >
                            <div className='modal-content'>
                                <form onSubmit={handleCreateCommunity}>
                                    <div className='form-group'>
                                        <label htmlFor='community-title'>Community Title</label>
                                        <input
                                            id='community-title'
                                            type='text'
                                            placeholder='Enter a catchy title'
                                            value={createData.title}
                                            onChange={(e) =>
                                                setCreateData({
                                                    ...createData,
                                                    title: e.target.value,
                                                })
                                            }
                                            maxLength='100'
                                        />
                                        <span className='char-count'>
                                            {createData.title.length}/100
                                        </span>
                                    </div>

                                    <div className='form-group'>
                                        <label htmlFor='community-description'>Description</label>
                                        <textarea
                                            id='community-description'
                                            placeholder='Describe your community...'
                                            value={createData.description}
                                            onChange={(e) =>
                                                setCreateData({
                                                    ...createData,
                                                    description: e.target.value,
                                                })
                                            }
                                            maxLength='500'
                                            rows='5'
                                        />
                                        <span className='char-count'>
                                            {createData.description.length}/500
                                        </span>
                                    </div>

                                    {createError && <div className='form-error'>{createError}</div>}

                                    <div className='modal-actions'>
                                        <button
                                            type='button'
                                            className='btn-cancel'
                                            onClick={() => setShowCreateModal(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type='submit'
                                            className='btn-primary'
                                            disabled={createLoading}
                                        >
                                            {createLoading ? "Creating..." : "Create Community"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </Modal>
                    )}

                    {showSearchModal && (
                        <Modal
                            title='Search Communities'
                            onClose={() => setShowSearchModal(false)}
                        >
                            <div className='modal-content search-modal'>
                                <div className='search-input-group'>
                                    <input
                                        type='text'
                                        placeholder='Search by name or description...'
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                {searchLoading && <LoadingSpinner />}

                                {!searchLoading && searchQuery && searchResults.length === 0 && (
                                    <div className='search-no-results'>
                                        <p>No communities found matching "{searchQuery}"</p>
                                    </div>
                                )}

                                {!searchLoading && searchResults.length > 0 && (
                                    <div className='search-results'>
                                        {searchResults.map((community) => (
                                            <div
                                                key={community.id}
                                                className='search-result-item'
                                            >
                                                <div>
                                                    <h4>{community.title}</h4>
                                                    <p>{community.description}</p>
                                                    <span className='result-meta'>
                                                        {community.memberCount} members •{" "}
                                                        {community.postCount} posts
                                                    </span>
                                                </div>
                                                <button
                                                    className='btn-primary'
                                                    onClick={() => {
                                                        setShowSearchModal(false)
                                                        handleJoinAndNavigate(community.id)
                                                    }}
                                                >
                                                    Join
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className='modal-actions'>
                                    <button
                                        type='button'
                                        className='btn-cancel'
                                        onClick={() => setShowSearchModal(false)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </Modal>
                    )}
                </>
            )}

            <Footer />
        </div>
    )
}
