import React, { useEffect, useMemo, useRef, useState } from "react"
import { io } from "socket.io-client"
import { useLocation, useNavigate } from "react-router-dom"
import * as monaco from "monaco-editor"
import Navbar from "../components/Navbar"
import Modal from "../components/Modal"
import { useAuth } from "../context/AuthContext"
import "./SolvePage.css"

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "https://collaborative-coding-platform-pvdr.onrender.com"

// These are the language choices shown in the dropdown.
const LANGUAGE_OPTIONS = [
    { id: "javascript", label: "JavaScript" },
    { id: "python", label: "Python" },
    { id: "java", label: "Java" },
    { id: "csharp", label: "C#" },
]

const LANGUAGE_LABELS = LANGUAGE_OPTIONS.reduce((accumulator, option) => {
    accumulator[option.id] = option.label
    return accumulator
}, {})

const getLanguageLabel = (languageKey) => LANGUAGE_LABELS[languageKey] || languageKey || "code"

// This is the fallback starter code for each language.
const STARTER_SNIPPETS = {
    javascript: `function solve(input) {
    // Write your solution here
    return input
}`,
    python: `def solve(input_data):
    # Write your solution here
    return input_data`,
    java: `public static String solve(String input) {
    // Write your solution here
    return input;
}`,
    csharp: `public static string Solve(string input) {
    // Write your solution here
    return input;
}`,
}

// Some templates come with "\\n" in the text, so we turn that into real new lines.
const normalizeTemplateCode = (value) => {
    if (typeof value !== "string") {
        return ""
    }

    return value.replace(/\\n/g, "\n")
}

// Normalizes different id shapes into a plain string before sending them back to the API.
const normalizeObjectId = (rawId) => {
    if (typeof rawId === "string") {
        return rawId.trim()
    }

    if (!rawId || typeof rawId !== "object") {
        return ""
    }

    if (typeof rawId.$oid === "string") {
        return rawId.$oid.trim()
    }

    if (typeof rawId._id === "string") {
        return rawId._id.trim()
    }

    if (typeof rawId.id === "string") {
        return rawId.id.trim()
    }

    if (typeof rawId.toHexString === "function") {
        return rawId.toHexString().trim()
    }

    if (typeof rawId.toString === "function") {
        const text = rawId.toString().trim()

        return text === "[object Object]" ? "" : text
    }

    return ""
}

// Rules we use to wrap Java and C# code when it is missing required structure.
const COMPILED_LANGUAGE_CONFIG = {
    csharp: {
        className: "Program",
        classMatcher: /public\s+class\s+Program\b/,
        imports: [
            { line: "using System;", matcher: /using\s+System\s*;/ },
            {
                line: "using System.Collections.Generic;",
                matcher: /using\s+System\.Collections\.Generic\s*;/,
            },
        ],
        mainSignature: "public static void Main(string[] args)",
        mainMatcher: /public\s+static\s+void\s+Main\s*\(/,
    },
    java: {
        className: "Main",
        classMatcher: /public\s+class\s+Main\b/,
        imports: [{ line: "import java.util.*;", matcher: /import\s+java\.util\.\*\s*;/ }],
        mainSignature: "public static void main(String[] args)",
        mainMatcher: /public\s+static\s+void\s+main\s*\(/,
    },
}

// Adds one level of indentation to each line.
const indentCode = (value) =>
    value
        .split("\n")
        .map((line) => `    ${line}`)
        .join("\n")

// Makes sure Java/C# code has imports, a class, and a main method when needed.
const ensureCompiledLanguageBoilerplate = (templateCode, config) => {
    const code = normalizeTemplateCode(templateCode)

    // Add any missing import lines.
    const importBlock = config.imports
        .filter(({ matcher }) => !matcher.test(code))
        .map(({ line }) => line)
        .join("\n")

    const imports = importBlock ? `${importBlock}\n\n` : ""

    // Check what is already present in the template.
    const hasClassDeclaration = /\bclass\s+\w+/.test(code)
    const hasEntryClass = config.classMatcher.test(code)
    const hasMainMethod = config.mainMatcher.test(code)

    // Fallback class we add when the template has no class at all.
    const mainOnlyClass = `public class ${config.className} {\n    ${config.mainSignature} {\n        // Add testing here\n    }\n}`

    // If class and main already exist, only return code with any missing imports.
    if (hasEntryClass && hasMainMethod) {
        return `${imports}${code}`
    }

    // If there is some class but not the entry class/main, append a safe entry class.
    if (hasClassDeclaration) {
        return `${imports}${code}\n\n${mainOnlyClass}`
    }

    // If there is no class at all, wrap the snippet in a class and add main.
    return `${imports}public class ${config.className} {\n${indentCode(code)}\n\n    ${config.mainSignature} {\n        // Add testing here\n    }\n}`
}

// Applies extra boilerplate only for compiled languages.
const ensureLanguageBoilerplate = (languageKey, templateCode) => {
    const config = COMPILED_LANGUAGE_CONFIG[languageKey]
    return config
        ? ensureCompiledLanguageBoilerplate(templateCode, config)
        : normalizeTemplateCode(templateCode)
}

// Builds starter code per language for the current challenge.
const buildStarterSnippetsForChallenge = (challenge) => {
    const starterTemplate = challenge?.starterTemplate

    return Object.keys(STARTER_SNIPPETS).reduce((accumulator, languageKey) => {
        // Use challenge template if present, otherwise use fallback starter snippet.
        const challengeTemplate = starterTemplate?.[languageKey]
        const sourceTemplate =
            typeof challengeTemplate === "string" && challengeTemplate.length > 0
                ? challengeTemplate
                : STARTER_SNIPPETS[languageKey]

        // Make sure each language starts with clean usable code.
        accumulator[languageKey] = ensureLanguageBoilerplate(languageKey, sourceTemplate)
        return accumulator
    }, {})
}

export function SolvePage() {
    // Router helpers for reading challenge state and navigating back.
    const navigate = useNavigate()
    const location = useLocation()
    const { authAxios, accessToken, user } = useAuth()

    // Challenge data comes from the previous page using router state.
    const challenge = location.state?.challenge
    const collaboration = location.state?.collaboration || null
    const challengeId = normalizeObjectId(challenge?._id)
    const starterSnippets = useMemo(
        () => buildStarterSnippetsForChallenge(challenge),
        [challengeId],
    )

    // Page state for editor, run input, and result UI.
    const [selectedLanguage, setSelectedLanguage] = useState("javascript")
    const [codeByLanguage, setCodeByLanguage] = useState(starterSnippets)
    const [stdin, setStdin] = useState("")
    const [isRunning, setIsRunning] = useState(false)
    const [runResult, setRunResult] = useState(null)
    const [runError, setRunError] = useState("")
    const [activeModal, setActiveModal] = useState(null)
    const [isCompleted, setIsCompleted] = useState(Boolean(challenge?.isCompleted))
    const [collaborationStatus, setCollaborationStatus] = useState("")
    const [collaborationNotice, setCollaborationNotice] = useState("")
    const [isSocketConnected, setIsSocketConnected] = useState(false)

    // Refs for Monaco instance, container, and current language tracking.
    const editorInstanceRef = useRef(null)
    const editorContainerRef = useRef(null)
    const socketRef = useRef(null)
    const applyingRemoteUpdateRef = useRef(false)
    const previousLanguageRef = useRef("javascript")
    const selectedLanguageRef = useRef("javascript")

    useEffect(() => {
        selectedLanguageRef.current = selectedLanguage
    }, [selectedLanguage])

    useEffect(() => {
        // When challenge changes, reset code to that challenge's starter templates.
        setCodeByLanguage(starterSnippets)
        setIsCompleted(Boolean(challenge?.isCompleted))
        setRunResult(null)
        setRunError("")
        setCollaborationNotice("")
        setCollaborationStatus("")
        setIsRunning(false)
        setIsSocketConnected(false)
    }, [challengeId, starterSnippets, challenge?.isCompleted])

    useEffect(() => {
        // Create editor once when container is ready.
        if (!editorContainerRef.current || editorInstanceRef.current) {
            return
        }

        const initialCode = starterSnippets[selectedLanguage] || ""

        // Start Monaco with the selected language and starter code.
        const model = monaco.editor.createModel(initialCode, selectedLanguage)
        const editor = monaco.editor.create(editorContainerRef.current, {
            model,
            automaticLayout: true,
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            roundedSelection: true,
            tabSize: 4,
            theme: "vs-dark",
            wordWrap: "on",
        })

        // Save what the user types so each language keeps its own code.
        editor.onDidChangeModelContent(() => {
            if (applyingRemoteUpdateRef.current) {
                return
            }

            const modelValue = editor.getValue()
            const languageKey = previousLanguageRef.current

            setCodeByLanguage((previousCodeByLanguage) => ({
                ...previousCodeByLanguage,
                [languageKey]: modelValue,
            }))

            if (collaboration?.id && socketRef.current?.connected) {
                socketRef.current.emit("collaboration:code_change", {
                    collaborationId: collaboration.id,
                    language: languageKey,
                    code: modelValue,
                })
            }
        })

        // Keep the editor instance in a ref for later use.
        editorInstanceRef.current = editor

        return () => {
            // Clean up editor resources when component unmounts.
            editor.getModel()?.dispose()
            editor.dispose()
            editorInstanceRef.current = null
        }
    }, [])

    useEffect(() => {
        if (!collaboration?.id || !accessToken) {
            socketRef.current?.disconnect()
            socketRef.current = null
            setCollaborationStatus("")
            setIsSocketConnected(false)
            return undefined
        }

        const socket = io(API_BASE_URL, {
            auth: {
                token: accessToken,
            },
            transports: ["websocket"],
        })

        socketRef.current = socket
        setCollaborationStatus("Connecting to live collaboration...")
        setIsSocketConnected(false)

        socket.on("connect", () => {
            setIsSocketConnected(true)
            socket.emit(
                "collaboration:join",
                {
                    collaborationId: collaboration.id,
                    starterCodeByLanguage: starterSnippets,
                },
                (response) => {
                    if (!response?.ok) {
                        setCollaborationStatus(response?.message || "Unable to join collaboration.")
                        return
                    }

                    const roomState = response.roomState || {}
                    const roomCodeByLanguage = roomState.codeByLanguage || {}

                    if (roomState.runState?.active) {
                        setIsRunning(true)
                    }

                    if (Object.keys(roomCodeByLanguage).length > 0) {
                        setCodeByLanguage((previousCodeByLanguage) => {
                            const mergedCodeByLanguage = {
                                ...previousCodeByLanguage,
                                ...roomCodeByLanguage,
                            }
                            const currentLanguage = selectedLanguageRef.current
                            const nextCode =
                                mergedCodeByLanguage[currentLanguage] ||
                                starterSnippets[currentLanguage] ||
                                ""

                            const editor = editorInstanceRef.current
                            if (editor && editor.getValue() !== nextCode) {
                                applyingRemoteUpdateRef.current = true
                                editor.setValue(nextCode)
                                applyingRemoteUpdateRef.current = false
                            }

                            return mergedCodeByLanguage
                        })
                    }

                    setCollaborationStatus("Connected to live collaboration.")
                },
            )
        })

        socket.on("connect_error", (error) => {
            setIsSocketConnected(false)
            setCollaborationStatus(error?.message || "Unable to connect to live collaboration.")
        })

        socket.on("disconnect", () => {
            setIsSocketConnected(false)
            setCollaborationStatus("Disconnected from live collaboration.")
        })

        socket.on("collaboration:run_started", (payload) => {
            if (String(payload?.collaborationId || "") !== String(collaboration.id || "")) {
                return
            }

            setIsRunning(true)
            setRunError("")

            const runnerName = payload?.startedBy?.name || "Partner"
            const languageLabel = getLanguageLabel(payload?.language)

            setCollaborationNotice(`${runnerName} started a ${languageLabel} run.`)
        })

        socket.on("collaboration:run_result", (payload) => {
            if (String(payload?.collaborationId || "") !== String(collaboration.id || "")) {
                return
            }

            setIsRunning(false)
            setRunError(payload?.isCorrect === null ? payload?.message || "" : "")

            setRunResult({
                language: payload?.language,
                statusCode: payload?.statusCode,
                statusDescription: payload?.statusDescription,
                signal: payload?.signal,
                isCorrect: payload?.isCorrect,
                expectedOutput: payload?.expectedOutput,
                stdout: payload?.stdout,
                stderr: payload?.stderr,
                compileOutput: payload?.compileOutput,
                message: payload?.message,
                output: payload?.output,
            })

            if (payload?.isCorrect === true) {
                setIsCompleted(true)
            }

            const runnerName = payload?.runBy?.name || "Partner"
            const languageLabel = getLanguageLabel(payload?.language)
            const runAt = payload?.runAt ? new Date(payload.runAt).toLocaleTimeString() : "just now"

            setCollaborationNotice(`${runnerName} finished a ${languageLabel} run at ${runAt}.`)
        })

        socket.on("collaboration:run_unlocked", (payload) => {
            if (String(payload?.collaborationId || "") !== String(collaboration.id || "")) {
                return
            }

            setIsRunning(false)
        })

        socket.on("collaboration:code_update", (payload) => {
            if (!payload?.language || typeof payload.code !== "string") {
                return
            }

            if (String(payload?.updatedBy?.id || "") === String(user?.id || "")) {
                return
            }

            const remoteLanguage = String(payload.language)
            const remoteCode = payload.code
            const remoteEditor = editorInstanceRef.current

            setCodeByLanguage((previousCodeByLanguage) => ({
                ...previousCodeByLanguage,
                [remoteLanguage]: remoteCode,
            }))

            if (selectedLanguageRef.current === remoteLanguage && remoteEditor) {
                if (remoteEditor.getValue() !== remoteCode) {
                    applyingRemoteUpdateRef.current = true
                    remoteEditor.setValue(remoteCode)
                    applyingRemoteUpdateRef.current = false
                }
            }

            const collaboratorName = payload?.updatedBy?.name || "Partner"
            const languageLabel = getLanguageLabel(remoteLanguage)
            const updatedAt = payload?.updatedAt
                ? new Date(payload.updatedAt).toLocaleTimeString()
                : "just now"

            setCollaborationNotice(`${collaboratorName} updated ${languageLabel} at ${updatedAt}.`)
        })

        return () => {
            socket.disconnect()
            socketRef.current = null
        }
    }, [accessToken, collaboration?.id, starterSnippets, user?.id])

    useEffect(() => {
        // When language changes, save old language code and load new language code.
        const editor = editorInstanceRef.current

        if (!editor) {
            return
        }

        const previousLanguage = previousLanguageRef.current
        const previousCode = editor.getValue()

        setCodeByLanguage((previousCodeByLanguage) => {
            const mergedCodeByLanguage = {
                ...previousCodeByLanguage,
                [previousLanguage]: previousCode,
            }

            const nextCode =
                mergedCodeByLanguage[selectedLanguage] || starterSnippets[selectedLanguage]

            if (previousCode !== nextCode) {
                editor.setValue(nextCode)
            }

            return mergedCodeByLanguage
        })

        // Tell Monaco to update syntax highlighting for the selected language.
        const model = editor.getModel()

        if (model) {
            monaco.editor.setModelLanguage(model, selectedLanguage)
        }

        // Remember current language for the next switch.
        previousLanguageRef.current = selectedLanguage
    }, [selectedLanguage, challengeId])

    // Get current code directly from the editor so run is always using fresh text.
    const getCurrentCode = () => {
        const editor = editorInstanceRef.current

        if (editor) {
            return editor.getValue()
        }

        return codeByLanguage[selectedLanguage] || ""
    }

    // Send code to backend and show returned result.
    const handleRunCode = async () => {
        const sourceCode = getCurrentCode()

        // Stop early if editor is empty.
        if (!sourceCode.trim()) {
            setRunError("Please write some code before running.")
            setRunResult(null)
            return
        }

        try {
            // Show loading state and clear old errors.
            setIsRunning(true)
            setRunError("")

            // Clear old result while new run is in progress.
            setRunResult(null)

            // Keep false/0 values, only send empty string when result is truly missing.
            const expectedOutput =
                challenge?.result === null || challenge?.result === undefined
                    ? ""
                    : String(challenge.result)

            if (collaboration?.id) {
                if (!socketRef.current?.connected) {
                    throw new Error("Live collaboration connection is not ready yet.")
                }

                socketRef.current.emit(
                    "collaboration:run",
                    {
                        collaborationId: collaboration.id,
                        language: selectedLanguage,
                        sourceCode,
                        stdin,
                        expectedOutput,
                        challengeId,
                    },
                    (response) => {
                        if (!response?.ok) {
                            setIsRunning(false)
                            setRunError(response?.message || "Unable to start collaborative run.")
                        }
                    },
                )

                return
            }

            // Call run endpoint with language, code, input, and expected output.
            const response = await authAxios.post("/api/execute", {
                language: selectedLanguage,
                sourceCode,
                stdin,
                expectedOutput,
                challengeId,
            })

            // Show backend response in the result panel.
            setRunResult(response.data)

            if (response.data?.isCorrect === true) {
                setIsCompleted(true)
            }
        } catch (error) {
            // Prefer backend message, otherwise show a friendly fallback.
            const message =
                error.response?.data?.message ||
                error?.message ||
                "Unable to run code right now. Please try again shortly."

            setRunError(message)
            setRunResult(error.response?.data || null)
        } finally {
            // Always stop loading when request ends.
            setIsRunning(false)
        }
    }

    // Hint text shown in hint modal.
    const hintText = challenge?.hint || "No hint is available for this challenge."

    // Solution text shown in solution modal for the selected language.
    const solutionText = (() => {
        const value = challenge?.solutions?.[selectedLanguage]

        if (typeof value !== "string" || value.trim().length === 0) {
            return "No solution is available for this language."
        }

        return normalizeTemplateCode(value)
    })()

    // Label and style for grading badge.
    const verdictLabel =
        runResult?.isCorrect === true
            ? "Correct"
            : runResult?.isCorrect === false
              ? "Incorrect"
              : "Not graded"

    const verdictClassName =
        runResult?.isCorrect === true
            ? "solve-verdict solve-verdict-correct"
            : runResult?.isCorrect === false
              ? "solve-verdict solve-verdict-incorrect"
              : "solve-verdict"

    return (
        // Main solve page wrapper.
        <div className='page page-solve'>
            <Navbar />

            <main className='solve-main'>
                {!challenge ? (
                    // If user opened this page directly, show a friendly empty state.
                    <section className='solve-empty-state'>
                        <h1>No challenge selected</h1>
                        <p>
                            Open a challenge from the challenge list first so we can load its
                            problem statement here.
                        </p>
                        <button
                            type='button'
                            className='solve-primary-button'
                            onClick={() => navigate("/challenges")}
                        >
                            Back to Challenges
                        </button>
                    </section>
                ) : (
                    <>
                        {/* Challenge details section */}
                        <section className='solve-problem-card'>
                            <div className='solve-problem-meta-row'>
                                <div className='solve-problem-meta'>
                                    <span>{challenge.type}</span>
                                    <span>{challenge.difficulty}</span>
                                </div>

                                {isCompleted ? (
                                    <span className='solve-problem-completed'>Completed</span>
                                ) : null}
                            </div>
                            <h1>{challenge.title}</h1>
                            <p>{challenge.challengeContent}</p>
                            <p style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.9rem', margin: '8px 0' }}>
                                Important tip: ensure you print the result to score the question.
                            </p>

                            {collaboration ? (
                                <div className='solve-collaboration-banner'>
                                    <strong>Collaboration session:</strong> Topic{" "}
                                    {collaboration.topic || "Unknown topic"}
                                    {collaboration.collaborator?.name
                                        ? ` • Partner ${collaboration.collaborator.name}`
                                        : ""}
                                    {collaborationStatus ? (
                                        <span className='solve-collaboration-status'>
                                            {collaborationStatus}
                                        </span>
                                    ) : null}
                                </div>
                            ) : null}

                            <div className='solve-problem-actions'>
                                <button
                                    type='button'
                                    className='solve-secondary-button'
                                    onClick={() => setActiveModal("hint")}
                                >
                                    Hint
                                </button>
                                <button
                                    type='button'
                                    className='solve-secondary-button'
                                    onClick={() => setActiveModal("solution")}
                                >
                                    Solution
                                </button>
                            </div>
                        </section>

                        {/* Editor + run controls + run result */}
                        <section className='solve-editor-card'>
                            <div className='solve-editor-toolbar'>
                                <div className='solve-toolbar-controls'>
                                    <label htmlFor='language-select'>Language</label>
                                    <select
                                        id='language-select'
                                        value={selectedLanguage}
                                        onChange={(event) =>
                                            setSelectedLanguage(event.target.value)
                                        }
                                        aria-label='Choose coding language'
                                    >
                                        {LANGUAGE_OPTIONS.map((option) => (
                                            <option
                                                key={option.id}
                                                value={option.id}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    type='button'
                                    className='solve-run-button'
                                    onClick={handleRunCode}
                                    disabled={
                                        isRunning || (collaboration?.id && !isSocketConnected)
                                    }
                                >
                                    {isRunning ? "Running..." : "Run Code"}
                                </button>
                            </div>

                            {collaborationNotice ? (
                                <p className='solve-collaboration-notice'>{collaborationNotice}</p>
                            ) : null}

                            <div
                                ref={editorContainerRef}
                                className='solve-editor-container'
                                aria-label='Code editor'
                            />

                            <div className='solve-stdin-block'>
                                <label htmlFor='stdin-input'>Custom Input (stdin)</label>
                                <textarea
                                    id='stdin-input'
                                    value={stdin}
                                    onChange={(event) => setStdin(event.target.value)}
                                    placeholder='Optional input for your program'
                                />
                            </div>

                            {runError ? <p className='solve-run-error'>{runError}</p> : null}

                            {runResult ? (
                                <div className='solve-run-result'>
                                    <div className='solve-run-result-header'>
                                        <h2>Execution Result</h2>
                                        <span className={verdictClassName}>{verdictLabel}</span>
                                    </div>

                                    <div className='solve-result-grid'>
                                        <section className='solve-result-panel'>
                                            <h3>Output</h3>
                                            <pre>{runResult.output || "(no output)"}</pre>
                                        </section>

                                        <section className='solve-result-panel'>
                                            <h3>Stdout</h3>
                                            <pre>{runResult.stdout || "(empty)"}</pre>
                                        </section>

                                        <section className='solve-result-panel'>
                                            <h3>Stderr</h3>
                                            <pre>{runResult.stderr || "(empty)"}</pre>
                                        </section>

                                        <section className='solve-result-panel'>
                                            <h3>Compile Output</h3>
                                            <pre>{runResult.compileOutput || "(empty)"}</pre>
                                        </section>
                                    </div>
                                </div>
                            ) : null}
                        </section>
                    </>
                )}
            </main>

            {activeModal ? (
                // Reusable modal for hint and language solution.
                <Modal
                    title={activeModal === "hint" ? "Hint" : `Solution: ${selectedLanguage}`}
                    onClose={() => setActiveModal(null)}
                >
                    <pre>{activeModal === "hint" ? hintText : solutionText}</pre>
                </Modal>
            ) : null}

                    </div>
    )
}

export default SolvePage



