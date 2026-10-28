import React, { useEffect } from "react"
import "./Modal.css"

function Modal({ title, children, onClose, bodyClassName = "" }) {
    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === "Escape") {
                onClose()
            }
        }

        document.addEventListener("keydown", handleEscapeKey)

        return () => {
            document.removeEventListener("keydown", handleEscapeKey)
        }
    }, [onClose])

    return (
        <div
            className='modal-overlay'
            onClick={onClose}
            role='presentation'
        >
            <div
                className='modal-dialog'
                role='dialog'
                aria-modal='true'
                aria-label={title}
                onClick={(event) => event.stopPropagation()}
            >
                <div className='modal-header'>
                    <h2>{title}</h2>
                    <button
                        type='button'
                        className='modal-close-button'
                        onClick={onClose}
                        aria-label='Close modal'
                    >
                        ×
                    </button>
                </div>

                <div className={`modal-body ${bodyClassName}`.trim()}>{children}</div>
            </div>
        </div>
    )
}

export default Modal

