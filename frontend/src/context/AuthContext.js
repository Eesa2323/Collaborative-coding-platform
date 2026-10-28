import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import axios from "axios"

const AuthContext = createContext(null)

// Base URL for backend requests.
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "https://collaborative-coding-platform-pvdr.onrender.com"

export function AuthProvider({ children }) {
    // status: unknown (needs one restore check), authenticated, or guest.
    const [status, setStatus] = useState("unknown")
    const [user, setUser] = useState(null)
    const [accessToken, setAccessToken] = useState("")

    // We also keep token in a ref so interceptors always read latest value.
    const tokenRef = useRef("")

    // Promise ref prevents duplicate refresh calls at the same time.
    const refreshPromiseRef = useRef(null)

    // Axios client used for protected API calls.
    const authAxios = useMemo(() => {
        const instance = axios.create({
            baseURL: API_BASE_URL,
        })

        // Add access token to every request when available.
        instance.interceptors.request.use((requestConfig) => {
            const nextConfig = { ...requestConfig }
            nextConfig.headers = nextConfig.headers || {}

            if (tokenRef.current) {
                nextConfig.headers.Authorization = `Bearer ${tokenRef.current}`
            }

            return nextConfig
        })

        return instance
    }, [])

    // Store auth state in one place.
    const setAuthenticatedState = useCallback((nextUser, nextAccessToken) => {
        setUser(nextUser)
        setAccessToken(nextAccessToken)
        setStatus("authenticated")
        tokenRef.current = nextAccessToken
    }, [])

    // Clear auth state in one place.
    const setGuestState = useCallback(() => {
        setUser(null)
        setAccessToken("")
        setStatus("guest")
        tokenRef.current = ""
    }, [])

    // Silent refresh. This is used after reload to restore login from refresh cookie.
    const refreshSession = useCallback(async () => {
        // Reuse the same promise when refresh is already running.
        if (refreshPromiseRef.current) {
            return refreshPromiseRef.current
        }

        const promise = axios
            .post(
                `${API_BASE_URL}/api/auth/refresh`,
                {},
                {
                    withCredentials: true,
                },
            )
            .then((response) => {
                const nextUser = response.data?.user || null
                const nextAccessToken = response.data?.accessToken || ""

                if (!nextUser || !nextAccessToken) {
                    throw new Error("Missing session data")
                }

                setAuthenticatedState(nextUser, nextAccessToken)
                return true
            })
            .catch(() => {
                setGuestState()
                return false
            })
            .finally(() => {
                refreshPromiseRef.current = null
            })

        refreshPromiseRef.current = promise
        return promise
    }, [setAuthenticatedState, setGuestState])

    // This is called by protected routes only.
    const ensureAuth = useCallback(async () => {
        if (status === "authenticated") {
            return true
        }

        if (status === "guest") {
            return false
        }

        return refreshSession()
    }, [refreshSession, status])

    useEffect(() => {
        // If access token expires during a session, refresh once and retry request.
        const interceptorId = authAxios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const statusCode = error?.response?.status
                const originalRequest = error?.config

                if (statusCode !== 401 || !originalRequest) {
                    return Promise.reject(error)
                }

                if (originalRequest._retry) {
                    return Promise.reject(error)
                }

                originalRequest._retry = true

                const restored = await refreshSession()

                if (!restored) {
                    return Promise.reject(error)
                }

                const retryConfig = {
                    ...originalRequest,
                    headers: {
                        ...(originalRequest.headers || {}),
                    },
                }

                if (tokenRef.current) {
                    retryConfig.headers.Authorization = `Bearer ${tokenRef.current}`
                }

                return authAxios.request(retryConfig)
            },
        )

        return () => {
            authAxios.interceptors.response.eject(interceptorId)
        }
    }, [authAxios, refreshSession])

    useEffect(() => {
        // Rehydrate auth once on app load so public pages can reflect login state too.
        refreshSession()
    }, [refreshSession])

    // Login helper used by Login page.
    const login = useCallback(
        async ({ email, password }) => {
            const response = await axios.post(
                `${API_BASE_URL}/api/auth/login`,
                {
                    email,
                    password,
                },
                {
                    withCredentials: true,
                },
            )

            const nextUser = response.data?.user || null
            const nextAccessToken = response.data?.accessToken || ""

            if (!nextUser || !nextAccessToken) {
                throw new Error("Missing login data")
            }

            setAuthenticatedState(nextUser, nextAccessToken)
        },
        [setAuthenticatedState],
    )

    // Signup helper used by Signup page.
    const signup = useCallback(
        async ({ name, email, password }) => {
            const response = await axios.post(
                `${API_BASE_URL}/api/auth/signup`,
                {
                    name,
                    email,
                    password,
                },
                {
                    withCredentials: true,
                },
            )

            const nextUser = response.data?.user || null
            const nextAccessToken = response.data?.accessToken || ""

            if (!nextUser || !nextAccessToken) {
                throw new Error("Missing signup data")
            }

            setAuthenticatedState(nextUser, nextAccessToken)
        },
        [setAuthenticatedState],
    )

    // Logout helper clears backend cookie and local auth state.
    const logout = useCallback(async () => {
        try {
            await axios.post(
                `${API_BASE_URL}/api/auth/logout`,
                {},
                {
                    withCredentials: true,
                },
            )
        } catch {
            // If logout API fails, we still clear local state.
        }

        setGuestState()
    }, [setGuestState])

    const updateUser = useCallback((nextUser) => {
        setUser(nextUser)
    }, [])

    const value = useMemo(
        () => ({
            status,
            user,
            accessToken,
            authAxios,
            ensureAuth,
            login,
            signup,
            logout,
            updateUser,
        }),
        [accessToken, authAxios, ensureAuth, login, logout, signup, status, user, updateUser],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const contextValue = useContext(AuthContext)

    if (!contextValue) {
        throw new Error("useAuth must be used inside AuthProvider")
    }

    return contextValue
}

