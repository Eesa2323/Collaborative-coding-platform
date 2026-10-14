import React from "react"
import "./LoadingSpinner.css"

function LoadingSpinner({ label = "Loading challenges..." }) {
    return (
        <div
            className='loading-spinner'
            role='status'
            aria-live='polite'
        >
            <span className='loading-spinner__circle' />
            <span className='loading-spinner__label'>{label}</span>
        </div>
    )
}

export default LoadingSpinner
