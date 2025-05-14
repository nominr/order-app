import React, { useState } from 'react';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";   
import { useNavigate } from 'react-router-dom';
import { getFirestore } from 'firebase/firestore';
// import { getFunctions } from 'firebase/functions';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); 
// const functions = getFunctions(app);

export const handleSignOut = () => {
    signOut(auth).then(() => {
    // Sign-out successful.
        console.log('Sign-out successful');
        const navigate = useNavigate();
        navigate('/login');
    }).catch((error) => {
        console.error('Error during sign-out:', error);
    // An error happened.
    });    
};

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const navigate = useNavigate();
    
    const handleSubmit = (e) => {
        e.preventDefault();

        const email = e.target.email.value;
        const password = e.target.password.value;

        // console.log('Email:', email);
        // console.log('Password:', password);
        // alert('!');

        if (isSignUp) {
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // Signed in 
                    const user = userCredential.user;
                    console.log('sign up successful:', user);
                    navigate('/profile');
                    // alert('sign up successful!');
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.error('Error during sign in:', errorCode, errorMessage);
                    // alert('sign in failed: ' + errorMessage);
                });
        } else {
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // Signed in 
                    const user = userCredential.user;
                    console.log('Login successful:', user);
                    navigate('/home');
                    // alert('Login successful!');
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.error('Error during login:', errorCode, errorMessage);
                    // alert('Login failed: ' + errorMessage);
                });
        }
    };

    return (
        <div style={styles.container}>
            <h1> login or sign up to continue!  </h1>
            <h2>{isSignUp ? 'sign up' : 'login'}</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.inputGroup}>
                    <label htmlFor="email">email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label htmlFor="password">password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <button type="submit" style={styles.button}>
                    {isSignUp ? 'sign Up' : 'login'}
                </button>
            </form>

            <div style={styles.buttonRow}>
            <button
                onClick={() => setIsSignUp(!isSignUp)}
                style={{ ...styles.button, backgroundColor: '#6c757d' }}
            >
                {isSignUp ? 'switch to login' : 'switch to sign up'}
            </button>

            <button
                onClick={handleSignOut}
                style={{ ...styles.button, backgroundColor: '#dc3545' }}
            >
                sign out
            </button>
            </div>


        </div>
    );
};

const styles = {
    container: {
      maxWidth: '420px',
      margin: '60px auto',
      padding: '30px',
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      textAlign: 'center',
      backgroundColor: '#fff',
      fontFamily: "'Inter', sans-serif",
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
    },
    inputGroup: {
      marginBottom: '18px',
      textAlign: 'left',
    },
    input: {
      width: '100%',
      padding: '10px',
      marginTop: '6px',
      borderRadius: '6px',
      border: '1px solid #ccc',
      fontSize: '1rem',
      fontFamily: "'Inter', sans-serif",
    },
    button: {
      padding: '12px',
      fontSize: '1rem',
      backgroundColor: '#007bff',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      marginTop: '10px',
      fontFamily: "'Inter', sans-serif",
    },

    buttonRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '20px',
        gap: '10px',
      },
      
  };
  

export default Login;
export { auth, app, db};
