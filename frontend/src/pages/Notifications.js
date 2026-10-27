import React, { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import LoadingSpinner from "../components/LoadingSpinner"
import Modal from "../components/Modal"
import { useAuth } from "../context/AuthContext"
import "./Notifications.css"

function Notifications() {
    const { authAxios } = useAuth()
    const navigate = useNavigate()
    const [notifications, setNotifications] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [activeInvite, setActiveInvite] = useState(null)
    const [isResponding, setIsResponding] = useState(false)
    const [responseError, setResponseError] = useState("")

    const activeInviteStatus = useMemo(() => {
        if (!activeInvite) {
            return "pending"
        }

        const invite = notifications.find((notification) => notification.id === activeInvite.id)

        return invite?.data?.collaborationStatus || invite?.status || "pending"
    }, [activeInvite, notifications])

    useEffect(() => {
        let isMounted = true

        const fetchNotifications = async () => {
            try {
                setIsLoading(true)
                setErrorMessage("")

                const response = await authAxios.get("/api/notifications")
                const list = Array.isArray(response.data?.notifications)
                    ? response.data.notifications
                    : []

                if (!isMounted) {
                    return
                }

                setNotifications(list)
            } catch (error) {
                if (!isMounted) {
                    return
                }

                const message =
                    error.response?.data?.message ||
                    "Unable to load notifications right now. Please try again shortly."
                setNotifications([])
                setErrorMessage(message)
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        // Always refetch when this page is opened.
        fetchNotifications()

        return () => {
            isMounted = false
        }
    }, [authAxios])

    const openInviteDetails = (notification) => {
        if (notification.type !== "collaborate_invite") {
            return
        }

        setResponseError("")
        setActiveInvite(notification)
    }

    const closeInviteDetails = () => {
        if (isResponding) {
            return
        }

        setActiveInvite(null)
        setResponseError("")
    }

    const respondToInvite = async (action) => {
        if (!activeInvite?.data?.collaborationId) {
            return
        }

        try {
            setIsResponding(true)
            setResponseError("")

            const response = await authAxios.post("/api/collaborations/respond", {
                collaborationId: activeInvite.data.collaborationId,
                action,
            })

            const collaborationFromResponse = response.data?.collaboration || null

            setNotifications((currentNotifications) =>
                currentNotifications.map((notification) =>
                    notification.id === activeInvite.id
                        ? {
                              ...notification,
                              isRead: true,
                              data: {
                                  ...notification.data,
                                  collaborationStatus:
                                      action === "accept" ? "accepted" : "declined",
                              },
                          }
                        : notification,
                ),
            )

            // If accepted, redirect to the Solve page and pass challenge data via state
            if (action === "accept") {
                const fallbackChallenge = {
                    _id: activeInvite.data?.challengeId || "",
                    title: activeInvite.data?.challengeTitle || "",
                    type: activeInvite.data?.challengeType || "",
                    difficulty: activeInvite.data?.challengeDifficulty || "",
                    challengeContent: activeInvite.data?.challengeContent || "",
                }

                const challenge = collaborationFromResponse?.challenge || fallbackChallenge
                const collaboration = collaborationFromResponse || {
                    id: activeInvite.data?.collaborationId || "",
                    status: "accepted",
                    topic: activeInvite.data?.topic || "",
                    challengeId: fallbackChallenge._id,
                    challenge,
                    collaborator: {
                        id: activeInvite.data?.fromUserId || "",
                        name: activeInvite.data?.fromUserName || "Unknown user",
                    },
                }

                navigate("/solve", { state: { challenge, collaboration } })
            } else {
                setActiveInvite(null)
            }
        } catch (error) {
            setResponseError(
                error.response?.data?.message ||
                    "Unable to update this collaboration invite right now. Please try again.",
            )
        } finally {
            setIsResponding(false)
        }
    }

    const formatInviteTime = (createdAt) => {
        if (!createdAt) {
            return "Unknown time"
        }

        const parsedDate = new Date(createdAt)

        return Number.isNaN(parsedDate.getTime()) ? "Unknown time" : parsedDate.toLocaleString()
    }

    return (
        <div className='page page-notifications'>
            <Navbar />

            <main className='notifications-main'>
                <section className='notifications-card'>
                    <span className='notifications-eyebrow'>Inbox</span>
                    <h1>Notifications</h1>

                    {isLoading ? <LoadingSpinner label='Loading notifications...' /> : null}

                    {!isLoading && errorMessage ? (
                        <div className='notifications-error'>
                            <h2>Could not load notifications</h2>
                            <p>{errorMessage}</p>
                        </div>
                    ) : null}

                    {!isLoading && !errorMessage && notifications.length === 0 ? (
                        <div className='notifications-empty'>
                            <div
                                className='notifications-empty-icon'
                                aria-hidden='true'
                            >
                                <svg
                                    viewBox='0 0 24 24'
                                    role='img'
                                    focusable='false'
                                >
                                    <path d='M12 2a7 7 0 0 0-7 7v3.59L3.29 14.3A1 1 0 0 0 4 16h16a1 1 0 0 0 .71-1.7L19 12.59V9a7 7 0 0 0-7-7zm0 20a3 3 0 0 0 2.83-2H9.17A3 3 0 0 0 12 22z' />
                                </svg>
                            </div>
                            <h2>No notifications yet</h2>
                            <p>
                                You are all caught up. Collaboration invites and updates will appear
                                here.
                            </p>
                        </div>
                    ) : null}

                    {!isLoading && !errorMessage && notifications.length > 0 ? (
                        <div className='notifications-list'>
                            {notifications.map((notification) => (
                                <article
                                    key={notification.id}
                                    role={
                                        notification.type === "collaborate_invite"
                                            ? "button"
                                            : undefined
                                    }
                                    tabIndex={
                                        notification.type === "collaborate_invite" ? 0 : undefined
                                    }
                                    aria-label={
                                        notification.type === "collaborate_invite"
                                            ? `Open collaboration invite from ${notification.data?.fromUserName || "someone"}`
                                            : undefined
                                    }
                                    onClick={
                                        notification.type === "collaborate_invite"
                                            ? () => openInviteDetails(notification)
                                            : undefined
                                    }
                                    onKeyDown={
                                        notification.type === "collaborate_invite"
                                            ? (event) => {
                                                  if (event.key === "Enter" || event.key === " ") {
                                                      event.preventDefault()
                                                      openInviteDetails(notification)
                                                  }
                                              }
                                            : undefined
                                    }
                                    className={
                                        notification.isRead
                                            ? `notification-item ${
                                                  notification.type === "collaborate_invite"
                                                      ? "notification-item-clickable"
                                                      : ""
                                              }`
                                            : `notification-item notification-item-unread ${
                                                  notification.type === "collaborate_invite"
                                                      ? "notification-item-clickable"
                                                      : ""
                                              }`
                                    }
                                >
                                    <header>
                                        <h2>{notification.title}</h2>
                                        <span>{formatInviteTime(notification.createdAt)}</span>
                                    </header>
                                    <p>{notification.message || "No message available."}</p>
                                    <span className='notification-type'>
                                        {notification.type || "notification"}
                                    </span>

                                    {notification.type === "collaborate_invite" ? (
                                        <div className='notification-invite-meta'>
                                            <span>
                                                From{" "}
                                                {notification.data?.fromUserName || "another user"}
                                            </span>
                                            <span>
                                                Question{" "}
                                                {notification.data?.challengeTitle ||
                                                    "Unknown question"}
                                            </span>
                                        </div>
                                    ) : null}
                                </article>
                            ))}
                        </div>
                    ) : null}
                </section>
            </main>

            {activeInvite ? (
                <Modal
                    title='Collaboration invite details'
                    onClose={closeInviteDetails}
                    bodyClassName='notifications-modal-body'
                >
                    <div className='invite-details'>
                        <p className='invite-details-lead'>
                            {activeInvite.message || "You have received a collaboration invite."}
                        </p>

                        <dl className='invite-details-grid'>
                            <div>
                                <dt>From</dt>
                                <dd>{activeInvite.data?.fromUserName || "Unknown user"}</dd>
                            </div>
                            <div>
                                <dt>Topic</dt>
                                <dd>{activeInvite.data?.topic || "Unknown topic"}</dd>
                            </div>
                            <div>
                                <dt>Question</dt>
                                <dd>{activeInvite.data?.challengeTitle || "Unknown question"}</dd>
                            </div>
                            <div>
                                <dt>Challenge data</dt>
                                <dd>
                                    {activeInvite.data?.challengeType || "Unknown type"}
                                    {activeInvite.data?.challengeDifficulty
                                        ? ` • ${activeInvite.data.challengeDifficulty}`
                                        : ""}
                                </dd>
                            </div>
                            {activeInvite.data?.challengeContent ? (
                                <div className='invite-details-grid__full'>
                                    <dt>Challenge content</dt>
                                    <dd>{activeInvite.data.challengeContent}</dd>
                                </div>
                            ) : null}
                            <div>
                                <dt>Received</dt>
                                <dd>{formatInviteTime(activeInvite.createdAt)}</dd>
                            </div>
                        </dl>

                        {responseError ? (
                            <p className='invite-response-error'>{responseError}</p>
                        ) : null}

                        <div className='invite-actions'>
                            <button
                                type='button'
                                className='invite-button invite-button-secondary'
                                onClick={closeInviteDetails}
                                disabled={isResponding}
                            >
                                Close
                            </button>
                            <button
                                type='button'
                                className='invite-button invite-button-decline'
                                onClick={() => respondToInvite("decline")}
                                disabled={isResponding || activeInviteStatus !== "pending"}
                            >
                                Decline
                            </button>
                            <button
                                type='button'
                                className='invite-button invite-button-accept'
                                onClick={() => respondToInvite("accept")}
                                disabled={isResponding || activeInviteStatus !== "pending"}
                            >
                                Accept
                            </button>
                        </div>
                    </div>
                </Modal>
            ) : null}

                    </div>
    )
}

export default Notifications


