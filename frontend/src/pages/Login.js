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
            <div style={{ background: '#000000', border: '2px solid #000000', padding: '20px 16px', borderRadius: '8px', margin: '16px auto', maxWidth: '400px', textAlign: 'center', fontWeight: 600, color: '#ef4444', fontSize: '1.1rem' }}>
                For testing purposes, when logging in use: email: "brad@gmail.com" password: "Password12345!" OR create an actual account if preferred. When testing collaboration feature, use "Bob" or any other user as target and open new window and login as targeted collaboration user. Credentials: email: "bob@gmail.com", password: "Password12345!"
            </div>
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



