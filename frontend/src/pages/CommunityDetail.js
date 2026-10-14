import React, { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import LoadingSpinner from "../components/LoadingSpinner"
import "./CommunityDetail.css"

const MAX_CAPTION_LENGTH = 500
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

export default function CommunityDetail() {
    const { communityId } = useParams()
    const navigate = useNavigate()
    const { user, authAxios } = useAuth()
    const fileInputRef = useRef(null)
    const [community, setCommunity] = useState(null)
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [postCaption, setPostCaption] = useState("")
    const [selectedImage, setSelectedImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [postLoading, setPostLoading] = useState(false)
    const [postError, setPostError] = useState("")
    const [deletingPostId, setDeletingPostId] = useState(null)

    useEffect(() => {
        fetchCommunityDetails()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [communityId])

    const fetchCommunityDetails = async () => {
        try {
            setLoading(true)
            setError("")
            const response = await authAxios.get(`/api/communities/${communityId}`, {
                withCredentials: true,
            })

            if (response.data?.community) {
                setCommunity(response.data.community)
                setPosts(response.data.posts || [])
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load community")
            console.error("Error fetching community details:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0]

        if (!file) return

        if (file.size > MAX_IMAGE_SIZE) {
            setPostError(
                `Image must be smaller than 5MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
            )
            return
        }

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            setPostError("Only JPEG, PNG, and WebP images are allowed.")
            return
        }

        setPostError("")
        setSelectedImage(file)

        const reader = new FileReader()
        reader.onload = (event) => {
            setImagePreview(event.target?.result)
        }
        reader.readAsDataURL(file)
    }

    const handleCreatePost = async (e) => {
        e.preventDefault()
        setPostError("")

        const captionTrimmed = postCaption.trim()

        if (!captionTrimmed && !selectedImage) {
            setPostError("Post must have either a caption or an image.")
            return
        }

        if (captionTrimmed.length > MAX_CAPTION_LENGTH) {
            setPostError(`Caption must be ${MAX_CAPTION_LENGTH} characters or less.`)
            return
        }

        try {
            setPostLoading(true)
            const formData = new FormData()
            if (captionTrimmed) {
                formData.append("caption", captionTrimmed)
            }
            if (selectedImage) {
                formData.append("image", selectedImage)
            }

            const response = await authAxios.post(
                `/api/communities/${communityId}/posts`,
                formData,
                {
                    withCredentials: true,
                    headers: { "Content-Type": "multipart/form-data" },
                },
            )

            if (response.data?.post) {
                setPosts([response.data.post, ...posts])
                setSuccessMessage("Post created successfully!")
                setPostCaption("")
                setSelectedImage(null)
                setImagePreview(null)
                if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                }
                setTimeout(() => setSuccessMessage(""), 3000)
            }
        } catch (err) {
            setPostError(err.response?.data?.message || "Failed to create post")
            console.error("Error creating post:", err)
        } finally {
            setPostLoading(false)
        }
    }

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this post?")) {
            return
        }

        try {
            setDeletingPostId(postId)
            await authAxios.delete(`/api/communities/${communityId}/posts/${postId}`, {
                withCredentials: true,
            })

            setPosts(posts.filter((post) => post.id !== postId))
            setSuccessMessage("Post deleted successfully!")
            setTimeout(() => setSuccessMessage(""), 3000)
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete post")
            console.error("Error deleting post:", err)
        } finally {
            setDeletingPostId(null)
        }
    }

    if (loading) {
        return (
            <div className='page-community-detail'>
                <Navbar />
                <LoadingSpinner />
                <Footer />
            </div>
        )
    }

    if (!community) {
        return (
            <div className='page-community-detail'>
                <Navbar />
                <div className='community-detail-container'>
                    <div className='page-error-message'>{error || "Community not found."}</div>
                    <button
                        className='btn-back'
                        onClick={() => navigate("/communities")}
                    >
                        ← Back to Communities
                    </button>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className='page-community-detail'>
            <Navbar />

            <div className='community-detail-container'>
                {error && <div className='page-error-message'>{error}</div>}
                {successMessage && <div className='page-success-message'>{successMessage}</div>}

                {/* Community Header */}
                <div className='community-detail-header'>
                    <button
                        className='btn-back'
                        onClick={() => navigate("/communities")}
                    >
                        ← Back
                    </button>
                    <div className='community-header-content'>
                        <h1>{community.title}</h1>
                        <p className='community-creator'>Created by {community.creator.name}</p>
                        <p className='community-description'>{community.description}</p>
                        <div className='community-stats'>
                            <span>
                                {community.memberCount} member
                                {community.memberCount !== 1 ? "s" : ""}
                            </span>
                            <span>•</span>
                            <span>
                                {community.postCount} post{community.postCount !== 1 ? "s" : ""}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Posts Feed */}
                <div className='community-posts-section'>
                    <h2>Posts</h2>
                    {posts.length === 0 ? (
                        <div className='no-posts-message'>
                            <p>No posts yet. Be the first to share!</p>
                        </div>
                    ) : (
                        <div className='posts-feed'>
                            {posts.map((post) => {
                                const isOwnPost = user && String(user.id) === String(post.author.id)
                                return (
                                    <div
                                        key={post.id}
                                        className='post-card'
                                    >
                                        <div className='post-header'>
                                            <div>
                                                <h4>{post.author.name}</h4>
                                                <span className='post-time'>
                                                    {new Date(post.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {isOwnPost && (
                                                <button
                                                    className='post-delete-btn'
                                                    onClick={() => handleDeletePost(post.id)}
                                                    disabled={deletingPostId === post.id}
                                                    title='Delete post'
                                                >
                                                    {deletingPostId === post.id ? "..." : "✕"}
                                                </button>
                                            )}
                                        </div>

                                        {post.imageUrl && (
                                            <img
                                                src={`http://localhost:5000${post.imageUrl}`}
                                                alt='Post'
                                                className='post-image'
                                            />
                                        )}

                                        {post.caption && (
                                            <p className='post-caption'>{post.caption}</p>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Fixed Post Creation Input */}
            <div className='post-creation-sticky'>
                <div className='post-creation-container'>
                    <h3>Share Something</h3>
                    <form onSubmit={handleCreatePost}>
                        <div className='post-input-group'>
                            <textarea
                                placeholder="What's on your mind?"
                                value={postCaption}
                                onChange={(e) => setPostCaption(e.target.value)}
                                maxLength={MAX_CAPTION_LENGTH}
                                rows='3'
                            />
                            <span className='char-count'>
                                {postCaption.length}/{MAX_CAPTION_LENGTH}
                            </span>
                        </div>

                        {imagePreview && (
                            <div className='image-preview-container'>
                                <img
                                    src={imagePreview}
                                    alt='Preview'
                                    className='image-preview'
                                />
                                <button
                                    type='button'
                                    className='remove-image-btn'
                                    onClick={() => {
                                        setSelectedImage(null)
                                        setImagePreview(null)
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = ""
                                        }
                                    }}
                                >
                                    Remove Image
                                </button>
                            </div>
                        )}

                        {postError && <div className='form-error'>{postError}</div>}

                        <div className='post-actions'>
                            <button
                                type='button'
                                className='btn-image-upload'
                                onClick={() => fileInputRef.current?.click()}
                            >
                                📷 Add Image
                            </button>
                            <button
                                type='submit'
                                className='btn-post'
                                disabled={postLoading}
                            >
                                {postLoading ? "Posting..." : "Post"}
                            </button>
                        </div>

                        <input
                            ref={fileInputRef}
                            type='file'
                            accept='image/jpeg,image/png,image/webp'
                            onChange={handleImageSelect}
                            style={{ display: "none" }}
                        />
                    </form>
                </div>
            </div>

            <Footer />
        </div>
    )
}
