import React from "react"

function TopicQuestionPicker({
    selectedUserName,
    topics,
    selectedTopic,
    onTopicChange,
    questions,
    selectedQuestionId,
    onQuestionSelect,
    isLoading,
    errorMessage,
}) {
    return (
        <div className='collab-modal__section'>
            {/* Show who the current collaboration is with. */}
            <p className='collab-modal__selected-user'>
                Collaborating with: <strong>{selectedUserName || "User"}</strong>
            </p>

            <label htmlFor='collab-topic'>Select topic</label>
            <select
                id='collab-topic'
                value={selectedTopic}
                onChange={(event) => onTopicChange(event.target.value)}
                disabled={isLoading || topics.length === 0}
            >
                {topics.map((topic) => (
                    <option
                        key={topic}
                        value={topic}
                    >
                        {topic}
                    </option>
                ))}
            </select>

            <div className='collab-modal__question-list'>
                {isLoading ? (
                    <p className='collab-modal__empty'>Loading topics and questions...</p>
                ) : errorMessage ? (
                    <p className='collab-modal__empty'>{errorMessage}</p>
                ) : questions.length > 0 ? (
                    questions.map((question) => (
                        <button
                            key={question.id}
                            type='button'
                            className={
                                selectedQuestionId === question.id
                                    ? "collab-modal__question-item active"
                                    : "collab-modal__question-item"
                            }
                            onClick={() => onQuestionSelect(question.id)}
                        >
                            {question.text}
                        </button>
                    ))
                ) : (
                    <p className='collab-modal__empty'>No questions available for this topic.</p>
                )}
            </div>
        </div>
    )
}

export default TopicQuestionPicker
