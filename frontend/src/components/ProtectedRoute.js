import React, { useEffect } from "react"
import { Navigate, Outlet } from "react-router-dom"
import LoadingSpinner from "./LoadingSpinner"
import { useAuth } from "../context/AuthContext"

function ProtectedRoute() {
    const { status, ensureAuth } = useAuth()

    useEffect(() => {
        // Only run restore check when status is unknown.
        if (status !== "unknown") {
            return
        }

        const check = async () => {
            await ensureAuth()
        }

        check()
    }, [ensureAuth, status])

    // Show a small loader only while we do the first restore check.
    if (status === "unknown") {
        return <LoadingSpinner />
    }

    // If not logged in, send user to login page.
    if (status !== "authenticated") {
        return (
            <Navigate
                to='/login'
                replace
            />
        )
    }

    return <Outlet />
}

export default ProtectedRoute
