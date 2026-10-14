const SubmissionService = require("../../services/SubmissionService")

describe("SubmissionService - normalizeObjectId", () => {
    it("should normalize string ID", () => {
        const result = SubmissionService.normalizeObjectId("  abc123  ")
        expect(result).toBe("abc123")
    })

    it("should extract $oid from BSON format", () => {
        const result = SubmissionService.normalizeObjectId({ $oid: "  507f1f77bcf86cd799439011  " })
        expect(result).toBe("507f1f77bcf86cd799439011")
    })

    it("should extract _id from object", () => {
        const result = SubmissionService.normalizeObjectId({ _id: "test123" })
        expect(result).toBe("test123")
    })

    it("should extract id property", () => {
        const result = SubmissionService.normalizeObjectId({ id: "id456" })
        expect(result).toBe("id456")
    })

    it("should call toHexString if available", () => {
        const mockId = {
            toHexString: jest.fn(() => "  hexstring789  "),
        }
        const result = SubmissionService.normalizeObjectId(mockId)
        expect(result).toBe("hexstring789")
        expect(mockId.toHexString).toHaveBeenCalled()
    })

    it("should use toString as fallback", () => {
        const mockId = {
            toString: jest.fn(() => "toString123"),
        }
        const result = SubmissionService.normalizeObjectId(mockId)
        expect(result).toBe("toString123")
    })

    it("should return empty string for [object Object]", () => {
        const result = SubmissionService.normalizeObjectId({})
        expect(result).toBe("")
    })

    it("should return empty string for null", () => {
        const result = SubmissionService.normalizeObjectId(null)
        expect(result).toBe("")
    })

    it("should return empty string for undefined", () => {
        const result = SubmissionService.normalizeObjectId(undefined)
        expect(result).toBe("")
    })
})

describe("SubmissionService - normalizeText", () => {
    it("should normalize CRLF to LF", () => {
        const result = SubmissionService.normalizeText("line1\r\nline2\r\n")
        expect(result).toBe("line1\nline2")
    })

    it("should trim whitespace", () => {
        const result = SubmissionService.normalizeText("  hello world  \n\n")
        expect(result).toBe("hello world")
    })

    it("should handle null value", () => {
        const result = SubmissionService.normalizeText(null)
        expect(result).toBe("")
    })

    it("should handle undefined value", () => {
        const result = SubmissionService.normalizeText(undefined)
        expect(result).toBe("")
    })

    it("should convert number to string", () => {
        const result = SubmissionService.normalizeText(42)
        expect(result).toBe("42")
    })

    it("should preserve internal whitespace", () => {
        const result = SubmissionService.normalizeText("  hello   world  ")
        expect(result).toBe("hello   world")
    })
})

describe("SubmissionService - normalizeValue", () => {
    it("should normalize boolean true", () => {
        const result = SubmissionService.normalizeValue("true")
        expect(result).toBe(true)
    })

    it("should normalize boolean false", () => {
        const result = SubmissionService.normalizeValue("false")
        expect(result).toBe(false)
    })

    it("should handle Python True/False", () => {
        const result1 = SubmissionService.normalizeValue("True")
        const result2 = SubmissionService.normalizeValue("False")
        expect(result1).toBe(true)
        expect(result2).toBe(false)
    })

    it("should normalize integer", () => {
        const result = SubmissionService.normalizeValue("42")
        expect(result).toBe(42)
    })

    it("should normalize negative integer", () => {
        const result = SubmissionService.normalizeValue("-100")
        expect(result).toBe(-100)
    })

    it("should normalize float", () => {
        const result = SubmissionService.normalizeValue("3.14")
        expect(result).toBe(3.14)
    })

    it("should parse JSON object", () => {
        const result = SubmissionService.normalizeValue('{"key": "value"}')
        expect(result).toEqual({ key: "value" })
    })

    it("should parse JSON array", () => {
        const result = SubmissionService.normalizeValue("[1, 2, 3]")
        expect(result).toEqual([1, 2, 3])
    })

    it("should handle Python None", () => {
        const result = SubmissionService.normalizeValue("None")
        expect(result).toBe(null)
    })

    it("should split comma-separated values", () => {
        const result = SubmissionService.normalizeValue("1, 2, 3")
        expect(result).toEqual([1, 2, 3])
    })

    it("should return empty string for empty input", () => {
        const result = SubmissionService.normalizeValue("")
        expect(result).toBe("")
    })

    it("should sort object keys for consistency", () => {
        const result = SubmissionService.normalizeValue('{"z": 1, "a": 2, "m": 3}')
        expect(Object.keys(result)).toEqual(["a", "m", "z"])
    })
})

describe("SubmissionService - areEquivalentOutputs", () => {
    it("should match identical text outputs", () => {
        const result = SubmissionService.areEquivalentOutputs("hello\nworld", "hello\nworld")
        expect(result).toBe(true)
    })

    it("should match outputs with different line endings", () => {
        const result = SubmissionService.areEquivalentOutputs("hello\r\nworld", "hello\nworld")
        expect(result).toBe(true)
    })

    it("should match outputs with whitespace differences", () => {
        const result = SubmissionService.areEquivalentOutputs("  42  \n", "42")
        expect(result).toBe(true)
    })

    it("should match boolean outputs case-insensitively", () => {
        const result = SubmissionService.areEquivalentOutputs("True", "true")
        expect(result).toBe(true)
    })

    it("should match numeric outputs", () => {
        const result = SubmissionService.areEquivalentOutputs("42", "42.0")
        expect(result).toBe(false) // Different values
    })

    it("should match JSON objects regardless of key order", () => {
        const result = SubmissionService.areEquivalentOutputs(
            '{"z": 1, "a": 2}',
            '{"a": 2, "z": 1}',
        )
        expect(result).toBe(true)
    })

    it("should match JSON arrays exactly", () => {
        const result = SubmissionService.areEquivalentOutputs("[1, 2, 3]", "[1, 2, 3]")
        expect(result).toBe(true)
    })

    it("should not match different values", () => {
        const result = SubmissionService.areEquivalentOutputs("42", "43")
        expect(result).toBe(false)
    })
})

describe("SubmissionService - executeSubmission", () => {
    const mockFetch = jest.fn()

    beforeEach(() => {
        mockFetch.mockClear()
    })

    const service = new (require("../../services/SubmissionService").constructor)(mockFetch)

    it("should validate language support", async () => {
        await expect(
            service.executeSubmission({
                language: "ruby",
                sourceCode: "puts 'hello'",
            }),
        ).rejects.toThrow("Unsupported language")
    })

    it("should require non-empty source code", async () => {
        await expect(
            service.executeSubmission({
                language: "javascript",
                sourceCode: "",
            }),
        ).rejects.toThrow("sourceCode is required and must be a non-empty string")
    })

    it("should validate source code length", async () => {
        const longCode = "x".repeat(20001)
        await expect(
            service.executeSubmission({
                language: "javascript",
                sourceCode: longCode,
            }),
        ).rejects.toThrow("exceeds max length")
    })

    it("should validate stdin type", async () => {
        await expect(
            service.executeSubmission({
                language: "javascript",
                sourceCode: "console.log('hi')",
                stdin: 123,
            }),
        ).rejects.toThrow("stdin must be a string")
    })

    it("should validate stdin length", async () => {
        const longInput = "x".repeat(5001)
        await expect(
            service.executeSubmission({
                language: "javascript",
                sourceCode: "console.log('hi')",
                stdin: longInput,
            }),
        ).rejects.toThrow("stdin exceeds max length")
    })

    it("should execute code successfully", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => ({
                stdout: "42\n",
                stderr: "",
                compile_output: "",
                message: "",
            }),
        })

        const result = await service.executeSubmission({
            language: "javascript",
            sourceCode: "console.log(42)",
            expectedOutput: "42",
        })

        expect(result).toHaveProperty("isCorrect", true)
        expect(result).toHaveProperty("stdout", "42\n")
    })

    it("should detect incorrect output", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => ({
                stdout: "43\n",
                stderr: "",
                compile_output: "",
                message: "",
            }),
        })

        const result = await service.executeSubmission({
            language: "javascript",
            sourceCode: "console.log(43)",
            expectedOutput: "42",
        })

        expect(result).toHaveProperty("isCorrect", false)
    })

    it("should handle compile errors", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => ({
                stdout: "",
                stderr: "",
                compile_output: "SyntaxError: Unexpected token",
                message: "",
            }),
        })

        const result = await service.executeSubmission({
            language: "javascript",
            sourceCode: "console.log((((",
        })

        expect(result).toHaveProperty("isCorrect", false)
        expect(result).toHaveProperty("error", "SyntaxError: Unexpected token")
    })

    it("should handle runtime errors", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => ({
                stdout: "",
                stderr: "",
                compile_output: "",
                message: "Segmentation fault",
            }),
        })

        const result = await service.executeSubmission({
            language: "javascript",
            sourceCode: "throw new Error('test')",
        })

        expect(result).toHaveProperty("isCorrect", false)
    })

    it("should retry on server errors", async () => {
        mockFetch
            .mockResolvedValueOnce({
                ok: false,
                status: 503,
                text: () => "Service unavailable",
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => ({
                    stdout: "success\n",
                    stderr: "",
                    compile_output: "",
                    message: "",
                }),
            })

        const result = await service.executeSubmission({
            language: "javascript",
            sourceCode: "console.log('success')",
        })

        expect(result).toHaveProperty("isCorrect", true)
        expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it("should return error after max retries", async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            status: 503,
            text: () => "Service unavailable",
        })

        await expect(
            service.executeSubmission({
                language: "javascript",
                sourceCode: "console.log('hi')",
            }),
        ).rejects.toThrow()
    })
})
