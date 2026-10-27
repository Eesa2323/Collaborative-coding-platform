import React, { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import SearchAndTopicModal from "../components/SearchAndTopicModal"
import LoadingSpinner from "../components/LoadingSpinner"
import { useAuth } from "../context/AuthContext"
import "./Collaborate.css"

function Collaborate() {
    const navigate = useNavigate()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("active")
    const [successMessage, setSuccessMessage] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [collaborations, setCollaborations] = useState([])
    const [isLoadingCollaborations, setIsLoadingCollaborations] = useState(false)
    const [collaborationsError, setCollaborationsError] = useState("")
    const { authAxios } = useAuth()

    const loadActiveCollaborations = useCallback(async () => {
        try {
            setIsLoadingCollaborations(true)
            setCollaborationsError("")

            const response = await authAxios.get("/api/collaborations/active")
            const items = Array.isArray(response.data?.collaborations)
                ? response.data.collaborations
                : []

            setCollaborations(items)
        } catch (error) {
            setCollaborations([])
            setCollaborationsError(
                error.response?.data?.message || "Unable to load active collaborations right now.",
            )
        } finally {
            setIsLoadingCollaborations(false)
        }
    }, [authAxios])

    useEffect(() => {
        loadActiveCollaborations()
    }, [loadActiveCollaborations])

    // Search users from backend by text query.
    const handleSearchUsers = useCallback(
        async (queryText) => {
            const response = await authAxios.get("/api/users/search", {
                params: {
                    q: queryText,
                },
            })

            return response.data?.users || []
        },
        [authAxios],
    )

    // Load topics and challenge-question list for modal step 2.
    const handleLoadCollaborationCatalog = useCallback(async () => {
        const response = await authAxios.get("/api/challenges/catalog")

        return {
            topics: response.data?.topics || [],
            questions: response.data?.questions || [],
        }
    }, [authAxios])

    const handleCollaborationSubmit = useCallback(
        async ({ userId, topic, questionId }) => {
            setSuccessMessage("")
            setErrorMessage("")

            try {
                const response = await authAxios.post("/api/collaborations/invite", {
                    userId,
                    topic,
                    questionId,
                })

                const collaborationId = response.data?.collaboration?.id || ""
                setSuccessMessage(
                    collaborationId
                        ? `Collaboration invite sent. Topic: ${topic}. Invite id: ${collaborationId}`
                        : `Collaboration invite sent. Topic: ${topic}.`,
                )

                loadActiveCollaborations()
            } catch (error) {
                const message =
                    error.response?.data?.message ||
                    "Unable to send collaboration invite right now."
                setErrorMessage(message)
                throw error
            }
        },
        [authAxios, loadActiveCollaborations],
    )

    const handleOpenCollaboration = (collaboration) => {
        if (!collaboration?.challenge) {
            return
        }

        navigate("/solve", {
            state: {
                challenge: collaboration.challenge,
                collaboration,
            },
        })
    }

    if (isLoadingCollaborations && collaborations.length === 0) {
        return (
            <div className='page page-collaborate'>
                <Navbar />
                <main className='collaborate-main'>
                    <LoadingSpinner label='Loading active collaborations...' />
                </main>
            </div>
        )
    }

    const formatDateTime = (value) => {
        if (!value) {
            return "Unknown time"
        }

        const date = new Date(value)
        return Number.isNaN(date.getTime()) ? "Unknown time" : date.toLocaleString()
    }

    return (
        <div className='page page-collaborate'>
            <Navbar />

            <main className='collaborate-main'>
                <section className='collaborate-tabs'>
                    <button
                        type='button'
                        className={
                            activeTab === "start"
                                ? "collaborate-tab-button collaborate-tab-button-active"
                                : "collaborate-tab-button"
                        }
                        onClick={() => setActiveTab("start")}
                    >
                        Start Collaboration
                    </button>
                    <button
                        type='button'
                        className={
                            activeTab === "active"
                                ? "collaborate-tab-button collaborate-tab-button-active"
                                : "collaborate-tab-button"
                        }
                        onClick={() => setActiveTab("active")}
                    >
                        Active Collaborations
                    </button>
                </section>

                {activeTab === "active" ? (
                    <section className='collaborate-active-card'>
                        <div className='collaborate-active-header'>
                            <span className='collaborate-eyebrow'>Accepted sessions</span>
                            <h1>Active Collaborations</h1>
                            <p>
                                Only accepted collaborations are shown here. Click one to open its
                                challenge in the solve page.
                            </p>
                        </div>

                        {isLoadingCollaborations ? (
                            <LoadingSpinner label='Loading active collaborations...' />
                        ) : null}

                        {!isLoadingCollaborations && collaborationsError ? (
                            <p className='collaborate-error'>{collaborationsError}</p>
                        ) : null}

                        {!isLoadingCollaborations &&
                        !collaborationsError &&
                        collaborations.length === 0 ? (
                            <p className='collaborate-active-empty'>
                                No accepted collaborations yet.
                            </p>
                        ) : null}

                        {!isLoadingCollaborations &&
                        !collaborationsError &&
                        collaborations.length > 0 ? (
                            <div className='collaborate-active-list'>
                                {collaborations.map((collaboration) => (
                                    <article
                                        key={collaboration.id}
                                        role='button'
                                        tabIndex={0}
                                        className='collaborate-active-item'
                                        onClick={() => handleOpenCollaboration(collaboration)}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter" || event.key === " ") {
                                                event.preventDefault()
                                                handleOpenCollaboration(collaboration)
                                            }
                                        }}
                                    >
                                        <header>
                                            <h2>
                                                {collaboration.challenge?.title ||
                                                    "Untitled challenge"}
                                            </h2>
                                            <span>{formatDateTime(collaboration.updatedAt)}</span>
                                        </header>
                                        <p>
                                            Topic: {collaboration.topic || "Unknown topic"} •
                                            Partner:{" "}
                                            {collaboration.collaborator?.name || "Unknown user"}
                                        </p>
                                        <div className='collaborate-active-meta'>
                                            <span>
                                                {collaboration.challenge?.type || "Unknown type"}
                                            </span>
                                            <span>
                                                {collaboration.challenge?.difficulty ||
                                                    "Unknown difficulty"}
                                            </span>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : null}
                    </section>
                ) : null}

                {activeTab === "start" ? (
                    <section className='collaborate-hero'>
                        <span className='collaborate-eyebrow'>Team up and grow</span>
                        <h1>Collaborate with other learners on real coding topics.</h1>
                        <p>
                            Find a partner, pick a focused question, and move faster with shared
                            feedback and stronger solutions.
                        </p>

                        <button
                            type='button'
                            className='collaborate-primary-button'
                            onClick={() => setIsModalOpen(true)}
                        >
                            Collaborate
                        </button>

                        {successMessage ? (
                            <p className='collaborate-success'>{successMessage}</p>
                        ) : null}
                        {errorMessage ? <p className='collaborate-error'>{errorMessage}</p> : null}
                    </section>
                ) : null}

                {activeTab === "start" ? (
                    <section className='collaborate-features'>
                        <article className='collaborate-feature-card'>
                            <div className='collaborate-feature-icon'>
                                <svg
                                    viewBox='0 0 24 24'
                                    role='img'
                                    focusable='false'
                                >
                                    <path d='M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.98 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z' />
                                </svg>
                            </div>
                            <h2>Find Teammates</h2>
                            <p>
                                Search users instantly and invite someone who matches your pace and
                                interests.
                            </p>
                        </article>

                        <article className='collaborate-feature-card'>
                            <div className='collaborate-feature-icon'>
                                <svg
                                    viewBox='0 0 24 24'
                                    role='img'
                                    focusable='false'
                                >
                                    <path d='M19 3H5c-1.1 0-2 .9-2 2v14l4-4h12c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 8H7V9h10v2zm0-3H7V6h10v2z' />
                                </svg>
                            </div>
                            <h2>Focus Questions</h2>
                            <p>
                                Choose precise collaboration questions to keep sessions productive
                                and outcome-driven.
                            </p>
                        </article>

                        <article className='collaborate-feature-card'>
                            <div className='collaborate-feature-icon'>
                                <svg
                                    viewBox='0 0 24 24'
                                    role='img'
                                    focusable='false'
                                >
                                    <path d='M12 2 1 21h22L12 2zm1 14h-2v-2h2v2zm0-4h-2v-4h2v4z' />
                                </svg>
                            </div>
                            <h2>Build Better Solutions</h2>
                            <p>
                                Share approaches, spot blind spots early, and improve confidence for
                                harder challenge sets.
                            </p>
                        </article>
                    </section>
                ) : null}
            </main>

            {isModalOpen ? (
                <SearchAndTopicModal
                    title='Start Collaboration'
                    onSearchUsers={handleSearchUsers}
                    onLoadCatalog={handleLoadCollaborationCatalog}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleCollaborationSubmit}
                />
            ) : null}

                    </div>
    )
}

export default Collaborate


