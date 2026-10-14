const SUPPORTED_LANGUAGES = {
    javascript: { languageId: Number(process.env.JUDGE0_LANG_JS || 63) },
    python: { languageId: Number(process.env.JUDGE0_LANG_PY || 71) },
    java: { languageId: Number(process.env.JUDGE0_LANG_JAVA || 62) },
    csharp: { languageId: Number(process.env.JUDGE0_LANG_CSHARP || 51) },
}

const MAX_CODE_LENGTH = 20000
const MAX_STDIN_LENGTH = 5000

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

const normalizeText = (value) =>
    String(value || "")
        .replace(/\r\n/g, "\n")
        .trim()

const areEquivalentOutputs = (actual, expected) => {
    const normalizeValue = (rawValue) => {
        const value = normalizeText(rawValue)

        if (!value) {
            return ""
        }

        if (/^(true|false)$/i.test(value)) {
            return value.toLowerCase() === "true"
        }

        if (/^-?(0|[1-9]\d*)(\.\d+)?$/.test(value)) {
            return Number(value)
        }

        const parse = (text) => {
            try {
                return JSON.parse(text)
            } catch {
                return null
            }
        }

        const stable = (node) => {
            if (Array.isArray(node)) {
                return node.map(stable)
            }

            if (node && typeof node === "object") {
                return Object.keys(node)
                    .sort()
                    .reduce((accumulator, key) => {
                        accumulator[key] = stable(node[key])
                        return accumulator
                    }, {})
            }

            return node
        }

        const parsed =
            parse(value) ||
            parse(
                value
                    .replace(/\bTrue\b/g, "true")
                    .replace(/\bFalse\b/g, "false")
                    .replace(/\bNone\b/g, "null"),
            )

        if (parsed !== null) {
            return stable(parsed)
        }

        if (value.includes(",") && !value.startsWith("[") && !value.startsWith("{")) {
            return value.split(",").map((part) => normalizeValue(part))
        }

        return value
    }

    return JSON.stringify(normalizeValue(actual)) === JSON.stringify(normalizeValue(expected))
}

const executeSubmission = async ({
    language,
    sourceCode,
    stdin = "",
    expectedOutput = "",
    challengeId = "",
}) => {
    if (!language || !SUPPORTED_LANGUAGES[language]) {
        const error = new Error(
            `Unsupported language. Allowed values: ${Object.keys(SUPPORTED_LANGUAGES).join(", ")}.`,
        )
        error.statusCode = 400
        throw error
    }

    if (typeof sourceCode !== "string" || sourceCode.trim().length === 0) {
        const error = new Error("sourceCode is required and must be a non-empty string.")
        error.statusCode = 400
        throw error
    }

    if (sourceCode.length > MAX_CODE_LENGTH) {
        const error = new Error(`sourceCode exceeds max length of ${MAX_CODE_LENGTH} characters.`)
        error.statusCode = 400
        throw error
    }

    if (typeof stdin !== "string") {
        const error = new Error("stdin must be a string.")
        error.statusCode = 400
        throw error
    }

    if (stdin.length > MAX_STDIN_LENGTH) {
        const error = new Error(`stdin exceeds max length of ${MAX_STDIN_LENGTH} characters.`)
        error.statusCode = 400
        throw error
    }

    const runtime = SUPPORTED_LANGUAGES[language]
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    const judge0BaseUrl = process.env.JUDGE0_BASE_URL || "https://ce.judge0.com"
    const judge0ExecuteUrl = `${judge0BaseUrl}/submissions?base64_encoded=false&wait=true`

    const judge0Headers = {
        "Content-Type": "application/json",
    }

    if (process.env.JUDGE0_RAPIDAPI_KEY) {
        judge0Headers["X-RapidAPI-Key"] = process.env.JUDGE0_RAPIDAPI_KEY
    }

    if (process.env.JUDGE0_RAPIDAPI_HOST) {
        judge0Headers["X-RapidAPI-Host"] = process.env.JUDGE0_RAPIDAPI_HOST
    }

    let judge0Response

    try {
        judge0Response = await fetch(judge0ExecuteUrl, {
            method: "POST",
            headers: judge0Headers,
            body: JSON.stringify({
                language_id: runtime.languageId,
                source_code: sourceCode,
                stdin,
            }),
            signal: controller.signal,
        })
    } finally {
        clearTimeout(timeout)
    }

    if (!judge0Response.ok) {
        const failureBody = await judge0Response.text()
        const error = new Error("Execution engine failed to run the submission.")
        error.statusCode = 502
        error.details = failureBody
        throw error
    }

    const executionResult = await judge0Response.json()
    const stdout = String(executionResult.stdout || "")
    const stderr = String(executionResult.stderr || "")
    const compileOutput = String(executionResult.compile_output || "")
    const messageOutput = String(executionResult.message || "")
    const status = executionResult.status || {}
    const output = String(stdout || stderr || compileOutput || messageOutput || "")
    const hasExpectedOutput = typeof expectedOutput === "string" && expectedOutput.trim().length > 0

    const isCorrect = hasExpectedOutput
        ? areEquivalentOutputs(stdout, expectedOutput) &&
          stderr.trim().length === 0 &&
          Number(status.id || 0) === 3
        : null

    return {
        language,
        statusCode: Number(status.id || 0),
        statusDescription: String(status.description || "Unknown"),
        signal: executionResult.exit_signal || null,
        isCorrect,
        expectedOutput: hasExpectedOutput ? expectedOutput : null,
        stdout,
        stderr,
        compileOutput,
        message: messageOutput,
        output,
        challengeId: normalizeObjectId(challengeId),
    }
}

module.exports = {
    SUPPORTED_LANGUAGES,
    MAX_CODE_LENGTH,
    MAX_STDIN_LENGTH,
    areEquivalentOutputs,
    executeSubmission,
    normalizeObjectId,
}
