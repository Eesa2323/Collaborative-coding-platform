import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "./Auth.css"
import { useAuth } from "../context/AuthContext"

function Signup() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    })
    const [errorMessage, setErrorMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate()
    const { signup } = useAuth()

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Clear old message for each new submit.
        setErrorMessage("")

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setErrorMessage("Passwords do not match.")
            return
        }

        try {
            // Show loading while request is running.
            setIsSubmitting(true)

            // Create account and keep user logged in.
            await signup({
                name: formData.name,
                email: formData.email,
                password: formData.password,
            })

            navigate("/challenges")
        } catch (error) {
            // Show backend message when available.
            const message =
                error.response?.data?.message || "Unable to sign up right now. Please try again."

            setErrorMessage(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className='page'>
            <div className='form-container'>
                <span className='title'>Register</span>
                <span className='subtitle'>Join our community today and level up your skills!</span>

                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label htmlFor='name'>Name:</label>
                        <input
                            id='name'
                            type='text'
                            name='name'
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label htmlFor='email'>Email:</label>
                        <input
                            id='email'
                            type='email'
                            name='email'
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label htmlFor='password'>Password:</label>
                        <input
                            id='password'
                            type='password'
                            name='password'
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label htmlFor='confirmPassword'>Confirm Password:</label>
                        <input
                            id='confirmPassword'
                            type='password'
                            name='confirmPassword'
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button
                        type='submit'
                        className='btn btn-primary'
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Creating account..." : "Sign Up"}
                    </button>
                </form>

                {errorMessage ? <p>{errorMessage}</p> : null}

                <p>
                    Already have an account? <Link to='/login'>Log in here</Link>
                </p>
            </div>
        </div>
    )
}

export default Signup
