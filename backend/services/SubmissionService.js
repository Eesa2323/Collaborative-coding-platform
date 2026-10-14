const SUPPORTED_LANGUAGES = {
    javascript: { languageId: Number(process.env.JUDGE0_LANG_JS || 63) },
    python: { languageId: Number(process.env.JUDGE0_LANG_PY || 71) },
    java: { languageId: Number(process.env.JUDGE0_LANG_JAVA || 62) },
    csharp: { languageId: Number(process.env.JUDGE0_LANG_CSHARP || 51) },
}

const MAX_CODE_LENGTH = 20000
const MAX_STDIN_LENGTH = 5000
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 100

class SubmissionService {
    constructor(fetchFn = fetch) {
        this.fetch = fetchFn
        this.judge0BaseUrl = process.env.JUDGE0_BASE_URL || "https://ce.judge0.com"
    }

    /**
     * Normalize ObjectId from various formats
     * @param {*} rawId - Raw ID value (string, object, etc.)
     * @returns {string} Normalized ID
     */
    normalizeObjectId(rawId) {
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

    /**
     * Normalize text output (trim whitespace, convert line endings)
     * @param {*} value - Raw value
     * @returns {string} Normalized text
     */
    normalizeText(value) {
        return String(value || "")
            .replace(/\r\n/g, "\n")
            .trim()
    }

    /**
     * Normalize value for comparison (handles boolean, numeric, JSON)
     * @param {*} rawValue - Raw value
     * @returns {*} Normalized value
     */
    normalizeValue(rawValue) {
        const value = this.normalizeText(rawValue)

        if (!value) {
            return ""
        }

        // Handle booleans
        if (/^(true|false)$/i.test(value)) {
            return value.toLowerCase() === "true"
        }

        // Handle numbers
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
            return value.split(",").map((part) => this.normalizeValue(part))
        }

        return value
    }

    /**
     * Compare actual output with expected output
     * @param {string} actual - Actual output from code execution
     * @param {string} expected - Expected output
     * @returns {boolean} True if outputs are equivalent
     */
    areEquivalentOutputs(actual, expected) {
        return (
            JSON.stringify(this.normalizeValue(actual)) ===
            JSON.stringify(this.normalizeValue(expected))
        )
    }

    /**
     * Execute code submission via Judge0 API with retry logic
     * @param {Object} params - Submission parameters
     * @param {string} params.language - Programming language (javascript, python, java, csharp)
     * @param {string} params.sourceCode - Source code to execute
     * @param {string} params.stdin - Standard input
     * @param {string} params.expectedOutput - Expected output for comparison
     * @param {string} params.challengeId - Challenge ID for tracking
     * @returns {Promise<Object>} Execution result with isCorrect flag
     * @throws {Error} If submission is invalid or execution fails
     */
    async executeSubmission(
        { language, sourceCode, stdin = "", expectedOutput = "", challengeId = "" },
        retryCount = 0,
    ) {
        // Validate language
        if (!language || !SUPPORTED_LANGUAGES[language]) {
            const error = new Error(
                `Unsupported language. Allowed values: ${Object.keys(SUPPORTED_LANGUAGES).join(", ")}.`,
            )
            error.statusCode = 400
            throw error
        }

        // Validate source code
        if (typeof sourceCode !== "string" || sourceCode.trim().length === 0) {
            const error = new Error("sourceCode is required and must be a non-empty string.")
            error.statusCode = 400
            throw error
        }

        if (sourceCode.length > MAX_CODE_LENGTH) {
            const error = new Error(
                `sourceCode exceeds max length of ${MAX_CODE_LENGTH} characters.`,
            )
            error.statusCode = 400
            throw error
        }

        // Validate stdin
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
        const judge0ExecuteUrl = `${this.judge0BaseUrl}/submissions?base64_encoded=false&wait=true`

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
            judge0Response = await this.fetch(judge0ExecuteUrl, {
                method: "POST",
                headers: judge0Headers,
                body: JSON.stringify({
                    language_id: runtime.languageId,
                    source_code: sourceCode,
                    stdin,
                }),
                signal: controller.signal,
            })
        } catch (error) {
            clearTimeout(timeout)
            if (retryCount < MAX_RETRIES) {
                await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
                return this.executeSubmission(
                    { language, sourceCode, stdin, expectedOutput, challengeId },
                    retryCount + 1,
                )
            }
            const err = new Error("Judge0 API connection failed")
            err.statusCode = 503
            throw err
        } finally {
            clearTimeout(timeout)
        }

        if (!judge0Response.ok) {
            if (retryCount < MAX_RETRIES && judge0Response.status >= 500) {
                await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
                return this.executeSubmission(
                    { language, sourceCode, stdin, expectedOutput, challengeId },
                    retryCount + 1,
                )
            }
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

        const hasCompileError = compileOutput.length > 0 && compileOutput !== "null"
        const hasRuntimeError = messageOutput && messageOutput !== "null" && messageOutput !== ""

        if (hasCompileError || hasRuntimeError) {
            return {
                isCorrect: false,
                stdout,
                stderr,
                compileOutput,
                messageOutput,
                error: hasCompileError ? compileOutput : messageOutput,
            }
        }

        const isCorrect = this.areEquivalentOutputs(stdout, expectedOutput)

        return {
            isCorrect,
            stdout,
            stderr,
            compileOutput,
            messageOutput,
        }
    }
}

module.exports = new SubmissionService()
