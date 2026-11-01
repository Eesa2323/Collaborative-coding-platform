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
            navigate("/")
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
            <aside className='login-demo-panel' aria-labelledby='login-demo-title'>
                <h2 id='login-demo-title'>Testing the app</h2>
                <p className='login-demo-intro'>
                    For testing purposes, use either set of example credentials below to sign in, or create your own account.
                </p>

                <div className='login-demo-account'>
                    <h3>Example credentials 1</h3>
                    <dl>
                        <div>
                            <dt>Email</dt>
                            <dd>brad@gmail.com</dd>
                        </div>
                        <div>
                            <dt>Password</dt>
                            <dd>Password12345!</dd>
                        </div>
                    </dl>
                </div>

                <div className='login-demo-account'>
                    <h3>Example credentials 2</h3>
                    <dl>
                        <div>
                            <dt>Email</dt>
                            <dd>bob@gmail.com</dd>
                        </div>
                        <div>
                            <dt>Password</dt>
                            <dd>Password12345!</dd>
                        </div>
                    </dl>
                </div>

                <p className='login-demo-collaboration'>
                    To test collaboration, choose “Bob” or another user as the target, open a new window, and log in
                    there as that target user.
                </p>
            </aside>
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
