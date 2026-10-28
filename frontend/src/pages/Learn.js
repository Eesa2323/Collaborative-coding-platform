import { useState } from "react"
import Navbar from "../components/Navbar"
import { LEARN_LESSONS } from "../data/learnLessons"
import "./Learn.css"

const languageLabels = [
    { key: "python", label: "Python" },
    { key: "csharp", label: "C#" },
    { key: "java", label: "Java" },
    { key: "javascript", label: "JavaScript" },
]

const Learn = () => {
    const [lessonIndex, setLessonIndex] = useState(0)
    const [sectionIndex, setSectionIndex] = useState(0)
    const [language, setLanguage] = useState("python")

    const currentLesson = LEARN_LESSONS[lessonIndex]
    const currentSection = currentLesson.sections[sectionIndex]

    const handleLessonSelect = (nextIndex) => {
        setLessonIndex(nextIndex)
        setSectionIndex(0)
        setLanguage("python")
    }

    const goToPreviousSection = () => {
        if (sectionIndex > 0) {
            setSectionIndex((value) => value - 1)
            return
        }

        if (lessonIndex > 0) {
            const previousLesson = LEARN_LESSONS[lessonIndex - 1]
            setLessonIndex((value) => value - 1)
            setSectionIndex(previousLesson.sections.length - 1)
            setLanguage("python")
        }
    }

    const goToNextSection = () => {
        if (sectionIndex < currentLesson.sections.length - 1) {
            setSectionIndex((value) => value + 1)
            return
        }

        if (lessonIndex < LEARN_LESSONS.length - 1) {
            setLessonIndex((value) => value + 1)
            setSectionIndex(0)
            setLanguage("python")
        }
    }

    const atFirstSection = lessonIndex === 0 && sectionIndex === 0
    const atLastSection =
        lessonIndex === LEARN_LESSONS.length - 1 &&
        sectionIndex === currentLesson.sections.length - 1

    return (
        <div
            style={{ marginTop: 50 }}
            className='page-learn'
        >
            <Navbar />
            <main className='learn-main'>
                <section className='learn-hero'>
                    <div>
                        <span className='learn-kicker'>Learn path</span>
                        <h1>Short lessons for the ideas behind the build.</h1>
                        <p>
                            Move through four topic tracks, each with focused subtopics and code in
                            Python, C#, Java, and JavaScript.
                        </p>
                    </div>
                    <div className='learn-hero-meta'>
                        <div>
                            <span>Track</span>
                            <strong>{currentLesson.title}</strong>
                        </div>
                        <div>
                            <span>Lesson</span>
                            <strong>
                                {sectionIndex + 1} / {currentLesson.sections.length}
                            </strong>
                        </div>
                        <div>
                            <span>Language</span>
                            <strong>
                                {languageLabels.find((item) => item.key === language)?.label}
                            </strong>
                        </div>
                    </div>
                </section>

                <div className='learn-layout'>
                    <aside className='learn-sidebar'>
                        <h2>Main Topics</h2>
                        <div className='learn-topic-list'>
                            {LEARN_LESSONS.map((lesson, index) => (
                                <button
                                    key={lesson.id}
                                    type='button'
                                    className={`learn-topic-item ${index === lessonIndex ? "active" : ""}`}
                                    onClick={() => handleLessonSelect(index)}
                                >
                                    <span>{lesson.eyebrow}</span>
                                    <strong>{lesson.title}</strong>
                                    <p>{lesson.summary}</p>
                                </button>
                            ))}
                        </div>
                    </aside>

                    <section className='learn-content'>
                        <div className='learn-content-header'>
                            <div>
                                <span className='learn-section-eyebrow'>
                                    {currentLesson.eyebrow}
                                </span>
                                <h2>{currentLesson.title}</h2>
                                <p>{currentLesson.summary}</p>
                            </div>
                            <div className='learn-chip-row'>
                                {currentLesson.chips.map((chip) => (
                                    <span
                                        key={chip}
                                        className='learn-chip'
                                    >
                                        {chip}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div
                            className='learn-section-nav'
                            aria-label='Lesson sections'
                        >
                            {currentLesson.sections.map((section, index) => (
                                <button
                                    key={section.title}
                                    type='button'
                                    className={`learn-section-pill ${index === sectionIndex ? "active" : ""}`}
                                    onClick={() => setSectionIndex(index)}
                                >
                                    {section.title}
                                </button>
                            ))}
                        </div>

                        <article className='learn-section-card'>
                            <span className='learn-section-step'>Section {sectionIndex + 1}</span>
                            <h3>{currentSection.title}</h3>
                            <p>{currentSection.description}</p>
                            <ul>
                                {currentSection.bullets.map((bullet) => (
                                    <li key={bullet}>{bullet}</li>
                                ))}
                            </ul>
                        </article>

                        <div className='learn-code-area'>
                            <div className='learn-code-header'>
                                <h3>{currentSection.exampleTitle}</h3>
                                <div
                                    className='learn-language-tabs'
                                    role='tablist'
                                    aria-label='Code examples by language'
                                >
                                    {languageLabels.map((item) => (
                                        <button
                                            key={item.key}
                                            type='button'
                                            role='tab'
                                            aria-selected={language === item.key}
                                            className={`learn-language-tab ${language === item.key ? "active" : ""}`}
                                            onClick={() => setLanguage(item.key)}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <pre className='learn-code-block'>
                                <code>{currentSection.examples[language]}</code>
                            </pre>
                        </div>

                        <div className='learn-nav-buttons'>
                            <button
                                type='button'
                                className='btn btn-secondary'
                                onClick={goToPreviousSection}
                                disabled={atFirstSection}
                            >
                                Back
                            </button>
                            <button
                                type='button'
                                className='btn btn-primary'
                                onClick={goToNextSection}
                                disabled={atLastSection}
                            >
                                Next
                            </button>
                        </div>
                    </section>
                </div>
            </main>
                    </div>
    )
}

export default Learn



