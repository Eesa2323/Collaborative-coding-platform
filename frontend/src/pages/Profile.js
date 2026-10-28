import React, { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import Modal from "../components/Modal"
import LoadingSpinner from "../components/LoadingSpinner"
import "./Profile.css"
import { Line } from "react-chartjs-2"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const DEFAULT_TOPICS = ["DSA", "AI", "Web Dev", "Game Dev"]

export default function Profile() {
    const { userId } = useParams()
    const { user, authAxios, updateUser, logout } = useAuth()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [showSettingsModal, setShowSettingsModal] = useState(false)
    const [selectedTopic, setSelectedTopic] = useState("all")
    const [detailsData, setDetailsData] = useState({
        name: user?.name || "",
        email: user?.email || "",
    })
    const [detailsError, setDetailsError] = useState("")
    const [detailsLoading, setDetailsLoading] = useState(false)
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })
    const [passwordError, setPasswordError] = useState("")
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const completedChallenges = profile?.completedChallenges || []
    const totalChallenges = completedChallenges.length

    useEffect(() => {
        fetchUserData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchUserData = async () => {
        try {
            setLoading(true)
            setError("")
            const endpoint = userId
                ? `/api/users/${userId}`
                : "/api/users/me"
            const response = await authAxios.get(endpoint, {
                withCredentials: true,
            })

            if (response.data?.user) {
                setProfile(response.data.user)
                setDetailsData({
                    name: response.data.user.name || "",
                    email: response.data.user.email || "",
                })
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch profile data")
            console.error("Error fetching profile:", err)
        } finally {
            setLoading(false)
        }
    }

    const topicCounts = useMemo(() => {
        return completedChallenges.reduce((summary, challenge) => {
            const type = challenge.type || "General"
            summary[type] = (summary[type] || 0) + 1
            return summary
        }, {})
    }, [completedChallenges])

    const topicOptions = useMemo(() => {
        const sortedTopics = Object.keys(topicCounts).sort(
            (a, b) => topicCounts[b] - topicCounts[a],
        )
        return [
            "all",
            ...sortedTopics,
            ...DEFAULT_TOPICS.filter((topic) => !sortedTopics.includes(topic)),
        ]
    }, [topicCounts])

    const topicStats = useMemo(() => {
        return Object.entries(topicCounts)
            .map(([topic, count]) => ({ topic, count }))
            .sort((a, b) => b.count - a.count)
    }, [topicCounts])

    const activeTopics = topicStats?.length ?? 0

    const isOwnProfile = !userId || userId === user?.id
    const level = profile?.level || 1
    const uniqueCompletedCount = profile?.completedChallengeCount ?? new Set(
        completedChallenges.map((challenge) => challenge.id),
    ).size
    const nextMilestoneCount = 4 - (uniqueCompletedCount % 4)
    const topTopic = topicStats[0]?.topic || "Not started yet"

    const getJoinDate = () => {
        if (!profile?.createdAt) {
            return "N/A"
        }
        return new Date(profile.createdAt).toLocaleDateString()
    }

    const generateProgressData = () => {
        const targetCount =
            selectedTopic === "all" ? totalChallenges : topicCounts[selectedTopic] || 0
        const points = 10
        const labels = []
        const data = []
        const baseDate = new Date()
        baseDate.setDate(baseDate.getDate() - points + 1)

        for (let index = 0; index < points; index += 1) {
            const nextDate = new Date(baseDate)
            nextDate.setDate(baseDate.getDate() + index)
            labels.push(nextDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }))
            const value = Math.round((targetCount * index) / Math.max(points - 1, 1))
            data.push(value)
        }

        return { labels, data }
    }

    const { labels, data } = generateProgressData()

    const chartData = {
        labels,
        datasets: [
            {
                label: `Challenges Completed (${selectedTopic})`,
                data,
                borderColor: "#8b5cf6",
                backgroundColor: "rgba(139, 92, 246, 0.12)",
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: "#7c3aed",
            },
        ],
    }

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                labels: {
                    color: "#374151",
                },
            },
            title: {
                display: true,
                text: `Progress trend: ${selectedTopic === "all" ? "All topics" : selectedTopic}`,
                color: "#111827",
                font: {
                    size: 18,
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    color: "#4b5563",
                },
                grid: {
                    color: "rgba(148, 163, 184, 0.15)",
                },
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: "#4b5563",
                    stepSize: 1,
                },
                grid: {
                    color: "rgba(148, 163, 184, 0.15)",
                },
            },
        },
    }

    const progressSummary = [
        {
            label: "Active subtopics",
            value: activeTopics,
        },
        {
            label: "Top subtopic",
            value: topTopic,
        },
        {
            label: "Current level",
            value: `Level ${level}`,
        },
    ]

    const recentChallenges = completedChallenges.slice(-6).reverse()

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            await logout()
        } finally {
            setIsLoggingOut(false)
        }
    }

    const handleProfileUpdate = async (event) => {
        event.preventDefault()
        setDetailsLoading(true)
        setDetailsError("")

        try {
            const response = await authAxios.put(
                "/api/users/me",
                {
                    name: detailsData.name,
                    email: detailsData.email,
                },
                { withCredentials: true },
            )

            if (response.data?.user) {
                setProfile(response.data.user)
                updateUser?.({
                    ...user,
                    name: response.data.user.name,
                    email: response.data.user.email,
                })
                setSuccessMessage("Profile saved successfully.")
                setShowSettingsModal(false)
                setTimeout(() => setSuccessMessage(""), 3000)
            }
        } catch (err) {
            setDetailsError(err.response?.data?.message || "Unable to save profile details.")
            console.error("Profile update failed:", err)
        } finally {
            setDetailsLoading(false)
        }
    }

    const handlePasswordChange = async (event) => {
        event.preventDefault()
        setPasswordError("")

        const { currentPassword, newPassword, confirmPassword } = passwordData

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError("All password fields are required.")
            return
        }

        if (newPassword.length < 6) {
            setPasswordError("New password must be at least 6 characters.")
            return
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match.")
            return
        }

        try {
            setPasswordLoading(true)
            const response = await authAxios.put(
                "/api/users/me/password",
                {
                    currentPassword,
                    newPassword,
                },
                { withCredentials: true },
            )

            if (response.data?.message) {
                setSuccessMessage(response.data.message)
                setShowSettingsModal(false)
                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
                setTimeout(() => setSuccessMessage(""), 3000)
            }
        } catch (err) {
            setPasswordError(err.response?.data?.message || "Failed to change password.")
            console.error("Password change failed:", err)
        } finally {
            setPasswordLoading(false)
        }
    }

    if (loading) {
        return (
            <div className='page-profile'>
                <Navbar />
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <div
            style={{ marginTop: 50 }}
            className='page-profile'
        >
            <Navbar />

            <div className='profile-container'>
                {error && <div className='profile-error-message'>{error}</div>}
                {successMessage && <div className='profile-success-message'>{successMessage}</div>}

                <div className='profile-header'>
                    <div className='profile-avatar'>
                        {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className='profile-info'>
                        <h1>{profile?.name || "Your profile"}</h1>
                        <p className='profile-email'>{profile?.email || "N/A"}</p>
                        <div className='profile-stats'>
                            <div className='stat-item'>
                                <span className='stat-label'>Level</span>
                                <span className='stat-value'>{`Level ${level}`}</span>
                            </div>
                            <div className='stat-item'>
                                <span className='stat-label'>Challenges Solved</span>
                                <span className='stat-value'>{totalChallenges}</span>
                            </div>
                            <div className='stat-item'>
                                <span className='stat-label'>Active Subtopics</span>
                                <span className='stat-value'>{activeTopics}</span>
                            </div>
                            <div className='stat-item'>
                                <span className='stat-label'>Joined</span>
                                <span className='stat-value'>{getJoinDate()}</span>
                            </div>
                        </div>
                    </div>
                    {isOwnProfile && (
                        <button
                            className='profile-settings-btn'
                            onClick={() => setShowSettingsModal(true)}
                        >
                            ⚙️ Settings
                        </button>
                    )}
                    {isOwnProfile && (
                        <button
                            className='profile-settings-btn'
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                        >
                            {isLoggingOut ? "Logging out..." : "Log Out"}
                        </button>
                    )}
                </div>

                <div className='profile-section summary-grid'>
                    {progressSummary.map((item) => (
                        <div
                            key={item.label}
                            className='summary-card'
                        >
                            <span className='summary-label'>{item.label}</span>
                            <span className='summary-value'>{item.value}</span>
                        </div>
                    ))}
                </div>

                <div className='profile-section'>
                    <h2>Skill Progress</h2>
                    <div className='topic-overview'>
                        {topicOptions.map((topic) => (
                            <button
                                key={topic}
                                className={`topic-pill ${selectedTopic === topic ? "topic-pill-active" : ""}`}
                                type='button'
                                onClick={() => setSelectedTopic(topic)}
                            >
                                {topic}
                            </button>
                        ))}
                    </div>
                    <div className='chart-controls'>
                        <span className='topic-meta'>
                            Showing progress for{" "}
                            <strong>
                                {selectedTopic === "all" ? "All topics" : selectedTopic}
                            </strong>
                        </span>
                    </div>
                    <div className='chart-container'>
                        <Line
                            data={chartData}
                            options={chartOptions}
                        />
                    </div>
                </div>

                <div className='profile-section'>
                    <h2>Subtopic Mastery</h2>
                    {topicStats.length > 0 ? (
                        <div className='subtopic-list'>
                            {topicStats.map((topic) => {
                                const percentage = Math.round(
                                    (topic.count / Math.max(totalChallenges, 1)) * 100,
                                )
                                return (
                                    <div
                                        key={topic.topic}
                                        className='subtopic-item'
                                    >
                                        <div className='subtopic-meta'>
                                            <span>{topic.topic}</span>
                                            <span>{topic.count} solved</span>
                                        </div>
                                        <div className='subtopic-bar'>
                                            <div
                                                className='subtopic-bar-fill'
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className='empty-challenges'>
                            <p>Track progress by solving challenges across subtopics.</p>
                        </div>
                    )}
                </div>

                <div className='profile-section'>
                    <h2>Recent Completed Challenges</h2>
                    {recentChallenges.length > 0 ? (
                        <div className='challenges-grid'>
                            {recentChallenges.map((challenge) => (
                                <div
                                    key={challenge.id}
                                    className='challenge-card challenge-card-extended'
                                >
                                    <div className='challenge-info'>
                                        <span className='challenge-number'>{challenge.title}</span>
                                        <span className='challenge-subtitle'>
                                            {challenge.type} · {challenge.difficulty}
                                        </span>
                                    </div>
                                    <div className='challenge-badge'>✓</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='empty-challenges'>
                            <p>No completed challenges yet. Start solving to build momentum.</p>
                            <a
                                href='/challenges'
                                className='start-challenges-btn'
                            >
                                Browse challenges
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {showSettingsModal && (
                <Modal
                    title='Account Settings'
                    onClose={() => setShowSettingsModal(false)}
                >
                    <div className='settings-modal'>
                        <div className='settings-section'>
                            <h2>Account details</h2>
                            <form onSubmit={handleProfileUpdate}>
                                <div className='form-group'>
                                    <label htmlFor='profileName'>Name</label>
                                    <input
                                        id='profileName'
                                        type='text'
                                        value={detailsData.name}
                                        onChange={(e) =>
                                            setDetailsData({ ...detailsData, name: e.target.value })
                                        }
                                        placeholder='Your display name'
                                    />
                                </div>
                                <div className='form-group'>
                                    <label htmlFor='profileEmail'>Email</label>
                                    <input
                                        id='profileEmail'
                                        type='email'
                                        value={detailsData.email}
                                        onChange={(e) =>
                                            setDetailsData({
                                                ...detailsData,
                                                email: e.target.value,
                                            })
                                        }
                                        placeholder='your.email@example.com'
                                    />
                                </div>
                                {detailsError && (
                                    <div className='settings-error-message'>{detailsError}</div>
                                )}
                                <div className='modal-actions'>
                                    <button
                                        type='button'
                                        className='btn-cancel'
                                        onClick={() => setShowSettingsModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type='submit'
                                        className='btn-save'
                                        disabled={detailsLoading}
                                    >
                                        {detailsLoading ? "Saving..." : "Save details"}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className='settings-divider' />

                        <div className='settings-section'>
                            <h2>Change password</h2>
                            <form onSubmit={handlePasswordChange}>
                                <div className='form-group'>
                                    <label htmlFor='currentPassword'>Current password</label>
                                    <input
                                        id='currentPassword'
                                        type='password'
                                        value={passwordData.currentPassword}
                                        onChange={(e) =>
                                            setPasswordData({
                                                ...passwordData,
                                                currentPassword: e.target.value,
                                            })
                                        }
                                        placeholder='Enter current password'
                                    />
                                </div>
                                <div className='form-group'>
                                    <label htmlFor='newPassword'>New password</label>
                                    <input
                                        id='newPassword'
                                        type='password'
                                        value={passwordData.newPassword}
                                        onChange={(e) =>
                                            setPasswordData({
                                                ...passwordData,
                                                newPassword: e.target.value,
                                            })
                                        }
                                        placeholder='Enter new password'
                                    />
                                </div>
                                <div className='form-group'>
                                    <label htmlFor='confirmPassword'>Confirm password</label>
                                    <input
                                        id='confirmPassword'
                                        type='password'
                                        value={passwordData.confirmPassword}
                                        onChange={(e) =>
                                            setPasswordData({
                                                ...passwordData,
                                                confirmPassword: e.target.value,
                                            })
                                        }
                                        placeholder='Confirm new password'
                                    />
                                </div>
                                {passwordError && (
                                    <div className='settings-error-message'>{passwordError}</div>
                                )}
                                <div className='modal-actions'>
                                    <button
                                        type='button'
                                        className='btn-cancel'
                                        onClick={() => setShowSettingsModal(false)}
                                    >
                                        Close
                                    </button>
                                    <button
                                        type='submit'
                                        className='btn-save'
                                        disabled={passwordLoading}
                                    >
                                        {passwordLoading ? "Saving..." : "Update password"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </Modal>
            )}

                    </div>
    )
}



