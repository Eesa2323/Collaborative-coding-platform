import React, { useEffect, useMemo, useState } from "react"
import Modal from "./Modal"
import TopicQuestionPicker from "./TopicQuestionPicker"
import "./SearchAndTopicModal.css"

function SearchAndTopicModal({
    title = "Start Collaboration",
    onSearchUsers,
    onLoadCatalog,
    onSubmit,
    onClose,
}) {
    const [step, setStep] = useState(1)
    const [searchQuery, setSearchQuery] = useState("")
    const [users, setUsers] = useState([])
    const [isSearchingUsers, setIsSearchingUsers] = useState(false)
    const [searchErrorMessage, setSearchErrorMessage] = useState("")
    const [selectedUser, setSelectedUser] = useState(null)
    const [topics, setTopics] = useState([])
    const [questions, setQuestions] = useState([])
    const [isLoadingCatalog, setIsLoadingCatalog] = useState(false)
    const [catalogErrorMessage, setCatalogErrorMessage] = useState("")
    const [selectedTopic, setSelectedTopic] = useState("")
    const [selectedQuestionId, setSelectedQuestionId] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitErrorMessage, setSubmitErrorMessage] = useState("")

    // Fetch users each time search text changes.
    useEffect(() => {
        const query = searchQuery.trim()

        if (!query) {
            setUsers([])
            setIsSearchingUsers(false)
            setSearchErrorMessage("")
            return
        }

        let isMounted = true

        const timeoutId = setTimeout(async () => {
            try {
                setIsSearchingUsers(true)
                setSearchErrorMessage("")

                const results = onSearchUsers ? await onSearchUsers(query) : []

                if (!isMounted) {
                    return
                }

                setUsers(Array.isArray(results) ? results : [])
            } catch {
                if (!isMounted) {
                    return
                }

                setUsers([])
                setSearchErrorMessage("Unable to search users right now.")
            } finally {
                if (isMounted) {
                    setIsSearchingUsers(false)
                }
            }
        }, 250)

        return () => {
            isMounted = false
            clearTimeout(timeoutId)
        }
    }, [onSearchUsers, searchQuery])

    // Load real topics/questions from backend when modal opens.
    useEffect(() => {
        let isMounted = true

        const loadCatalog = async () => {
            try {
                setIsLoadingCatalog(true)
                setCatalogErrorMessage("")

                const catalog = onLoadCatalog
                    ? await onLoadCatalog()
                    : { topics: [], questions: [] }

                if (!isMounted) {
                    return
                }

                const nextTopics = Array.isArray(catalog?.topics) ? catalog.topics : []
                const nextQuestions = Array.isArray(catalog?.questions) ? catalog.questions : []

                setTopics(nextTopics)
                setQuestions(nextQuestions)

                if (nextTopics.length > 0) {
                    setSelectedTopic(nextTopics[0])
                } else {
                    setSelectedTopic("")
                }
            } catch {
                if (!isMounted) {
                    return
                }

                setTopics([])
                setQuestions([])
                setSelectedTopic("")
                setCatalogErrorMessage("Unable to load topics right now.")
            } finally {
                if (isMounted) {
                    setIsLoadingCatalog(false)
                }
            }
        }

        loadCatalog()

        return () => {
            isMounted = false
        }
    }, [onLoadCatalog])

    const topicQuestions = useMemo(
        () => questions.filter((question) => question.topic === selectedTopic),
        [questions, selectedTopic],
    )

    const handlePrimaryAction = async () => {
        if (step === 1) {
            if (!selectedUser) {
                return
            }

            setSubmitErrorMessage("")
            setStep(2)
            return
        }

        if (!selectedUser || !selectedTopic || !selectedQuestionId) {
            return
        }

        try {
            setIsSubmitting(true)
            setSubmitErrorMessage("")

            if (onSubmit) {
                await onSubmit({
                    userId: selectedUser.id,
                    topic: selectedTopic,
                    questionId: selectedQuestionId,
                })
            }

            onClose()
        } catch (error) {
            setSubmitErrorMessage(
                error?.response?.data?.message || "Unable to send collaboration invite right now.",
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    const isPrimaryDisabled =
        (step === 1 ? !selectedUser : !selectedUser || !selectedTopic || !selectedQuestionId) ||
        isSubmitting

    return (
        <Modal
            title={title}
            onClose={onClose}
            bodyClassName='modal-body--no-scroll'
        >
            <div className='collab-modal'>
                <div className='collab-modal__stepper'>
                    <span className={step === 1 ? "active" : ""}>1. Find Teammate</span>
                    <span className={step === 2 ? "active" : ""}>2. Pick Focus</span>
                </div>

                {step === 1 ? (
                    <div className='collab-modal__section'>
                        <label htmlFor='collab-user-search'>Search user</label>
                        <input
                            id='collab-user-search'
                            type='text'
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder='Search by name or handle'
                        />

                        <div className='collab-modal__user-list'>
                            {!searchQuery.trim() ? (
                                <p className='collab-modal__empty'>
                                    Find users by typing a name or email.
                                </p>
                            ) : isSearchingUsers ? (
                                <p className='collab-modal__empty'>Searching users...</p>
                            ) : searchErrorMessage ? (
                                <p className='collab-modal__empty'>{searchErrorMessage}</p>
                            ) : users.length > 0 ? (
                                users.map((user) => (
                                    <button
                                        key={user.id}
                                        type='button'
                                        className={
                                            selectedUser?.id === user.id
                                                ? "collab-modal__user-item active"
                                                : "collab-modal__user-item"
                                        }
                                        onClick={() => setSelectedUser(user)}
                                    >
                                        <strong>{user.name}</strong>
                                        <span>{user.email}</span>
                                    </button>
                                ))
                            ) : (
                                <p className='collab-modal__empty'>No results found.</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <TopicQuestionPicker
                        selectedUserName={selectedUser?.name}
                        topics={topics}
                        selectedTopic={selectedTopic}
                        onTopicChange={(nextTopic) => {
                            setSelectedTopic(nextTopic)
                            setSelectedQuestionId("")
                        }}
                        questions={topicQuestions}
                        selectedQuestionId={selectedQuestionId}
                        onQuestionSelect={setSelectedQuestionId}
                        isLoading={isLoadingCatalog}
                        errorMessage={catalogErrorMessage}
                    />
                )}

                <div className='collab-modal__actions'>
                    {submitErrorMessage ? (
                        <p className='collab-modal__empty'>{submitErrorMessage}</p>
                    ) : null}

                    {step === 2 ? (
                        <button
                            type='button'
                            className='collab-modal__ghost-button'
                            onClick={() => setStep(1)}
                            disabled={isSubmitting}
                        >
                            Back
                        </button>
                    ) : null}

                    <button
                        type='button'
                        className='collab-modal__primary-button'
                        onClick={handlePrimaryAction}
                        disabled={isPrimaryDisabled}
                    >
                        {isSubmitting ? "Sending..." : step === 1 ? "Continue" : "Collaborate"}
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default SearchAndTopicModal
