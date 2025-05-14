import './App.css';
import React, { useState, useEffect } from 'react';

import Login from './pages/Login.jsx';
import { Navigate, BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HomeBar } from './components/HomeBar';
import Home from './pages/Home';

import { db, auth } from './pages/Login'; 
import { getDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Profile from './pages/Profile';

import Cart from './pages/Cart.jsx';
import Success from './pages/Success.jsx';
import Cancel from './pages/Cancel.jsx';


function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          setProfileComplete(userSnap.data().isProfileComplete || false);
        }
      }

      setLoading(false);
    });
    return () => unsubscribe();
  }, [])

  if (loading) {
    return <div>Loading...</div>;
  }
  if (user && profileComplete === null) return <div>Checking profile...</div>;

  const handleProfileComplete = () => {
    setProfileComplete(true); 
  };

  return (
    <div className="App"> 
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet"></link>

        <Router>
        <HomeBar />
          <main style={{ minHeight: 'calc(100vh - 200px)' }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/home"
                // element={user ? <Home /> : <Navigate to="/login" />}
                element={
                  user
                  ? profileComplete
                    ? <Home />
                    : <Navigate to="/profile" />
                  : <Navigate to="/login" />
                }
              />

              <Route
                path="/profile"
                element={
                  user ? (
                  <Profile onProfileComplete={handleProfileComplete} />
                ) : (
                  <Navigate to="/login" />
                )
                }
              />

              <Route path="/cart" element={<Cart />} />
              <Route path="/success" element={<Success />} />
              <Route path="/cancel" element={<Cancel />} />

              {/* <Route path="*" element={<Navigate to={user ? "/home" : "/login"} />} /> */}
              <Route path="*" element={<Navigate to={user ? (profileComplete ? "/home" : "/profile") : "/login"} />} />

            </Routes>
          </main>
        </Router>
    </div>
    
  );
}

export default App;
