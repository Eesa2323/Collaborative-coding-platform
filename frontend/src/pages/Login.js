import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "./Auth.css"
import { useAuth } from "../context/AuthContext"

function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate()
    const { login } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            // Clear old errors and show submit state.
            setErrorMessage("")
            setIsSubmitting(true)

            // Log in user and then send them to challenges.
            await login({ email, password })
            navigate("/challenges")
        } catch (error) {
            // Show friendly message from backend if available.
            const message =
                error.response?.data?.message || "Unable to log in right now. Please try again."

            setErrorMessage(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className='page'>
            <div className='form-container'>
                <span className='title'>Log In</span>
                <span className='subtitle'>Enter your details to continue your journey!</span>

                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label htmlFor='email'>Email:</label>
                        <input
                            id='email'
                            type='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className='form-group'>
                        <label htmlFor='password'>Password:</label>
                        <input
                            id='password'
                            type='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type='submit'
                        className='btn btn-primary'
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Logging in..." : "Log In"}
                    </button>
                </form>

                {errorMessage ? <p>{errorMessage}</p> : null}

                <p>
                    Don't have an account? <Link to='/signup'>Sign up here</Link>
                </p>
            </div>
        </div>
    )
}

export default Login
