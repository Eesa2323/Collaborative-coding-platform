const express = require("express")
const mongoose = require("mongoose")
const User = require("../models/User")
const { executeSubmission, normalizeObjectId } = require("../utils/runSubmission")
const router = express.Router()

// Main execution route.
router.post("/", async (req, res) => {
    try {
        const executionResult = await executeSubmission(req.body || {})

        // Persist solved challenge on user profile if this run is correct.
        const normalizedChallengeId = normalizeObjectId(executionResult.challengeId)
        const isValidChallengeObjectId = mongoose.Types.ObjectId.isValid(normalizedChallengeId)

        if (executionResult.isCorrect === true && isValidChallengeObjectId) {
            await User.findByIdAndUpdate(req.user?.userId, {
                $addToSet: {
                    completedChallenges: new mongoose.Types.ObjectId(normalizedChallengeId),
                },
            })
        }

        // Send response data used by the solve page.
        return res.status(200).json(executionResult)
    } catch (error) {
        const statusCode = Number(error?.statusCode || (error?.name === "AbortError" ? 504 : 500))

        return res.status(statusCode).json({
            message:
                statusCode === 504
                    ? "Execution timed out while waiting for the runner."
                    : error?.message || "Unexpected error while executing code.",
            details: error?.details || error?.message || "Unknown execution error.",
        })
    }
})

// Export router so server can mount this route.
module.exports = router
