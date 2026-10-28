import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import "./styles/global.css"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Learn from "./pages/Learn"
import Challenges from "./pages/Challenges"
import { SolvePage } from "./pages/SolvePage"
import Collaborate from "./pages/Collaborate"
import Notifications from "./pages/Notifications"
import LoadingSpinner from "./components/LoadingSpinner"
import ProtectedRoute from "./components/ProtectedRoute"
import Profile from "./pages/Profile"
import Search from "./pages/Search"
import Communities from "./pages/Communities"
import CommunityDetail from "./pages/CommunityDetail"

function AppRoutes() {
    const { status } = useAuth()
    if (status === "unknown") {
        return (
            <div style={{ background: '#6366f1', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LoadingSpinner />
            </div>
        )
    }
    return (
        <div className='App'>
            {/* Application routes */}
            <Routes>
                {/* Public routes */}
                <Route
                    path='/'
                    element={<Home />}
                />
                <Route
                    path='/login'
                    element={<Login />}
                />
                <Route
                    path='/signup'
                    element={<Signup />}
                />
                <Route
                    path='/search'
                    element={<Search />}
                />
                <Route
                    path='/learn'
                    element={<Learn />}
                />

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                    <Route
                        path='/challenges'
                        element={<Challenges />}
                    />
                    <Route
                        path='/solve'
                        element={<SolvePage />}
                    />
                    <Route
                        path='/collaborate'
                        element={<Collaborate />}
                    />
                    <Route
                        path='/notifications'
                        element={<Notifications />}
                    />
                    <Route
                        path='/profile'
                        element={<Profile />}
                    />
                    <Route
                        path='/profile/:userId'
                        element={<Profile />}
                    />
                    <Route
                        path='/communities'
                        element={<Communities />}
                    />
                    <Route
                        path='/communities/:communityId'
                        element={<CommunityDetail />}
                    />
                </Route>
            </Routes>
        </div>
    )
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </Router>
    )
}

export default App

