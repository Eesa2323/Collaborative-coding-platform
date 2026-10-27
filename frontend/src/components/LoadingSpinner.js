import React from "react"
import "./LoadingSpinner.css"

function LoadingSpinner({ label }) {
    return (
        <div
            className='loading-spinner'
            role='status'
            aria-live='polite'
        >
            <span className='loading-spinner__circle' />
            {label && <span className='loading-spinner__label'>{label}</span>}
        </div>
    )
}

export default LoadingSpinner
