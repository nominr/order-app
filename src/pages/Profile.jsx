import React, { useState, useEffect } from 'react';
import { db, auth, handleSignOut } from './Login'; 
import { deleteUser } from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
// import { useNavigate, useLocation } from 'react-router-dom';

const Profile = () => {
    const [isEditing, setIsEditing] = useState(true); 
    const [isProfileComplete, setIsProfileComplete] = useState(false);

    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        studentId: '',
        netId: '',
        college: '',
        email: '',
        isProfileComplete: false
    });

        
    useEffect(() => {
        const handleNavigation = (e) => {
            const shouldPreventNavigation = !isProfileComplete && isEditing;
            if (shouldPreventNavigation) {
                e.preventDefault();
                alert('you must complete your profile before leaving this page.');
            }
        };
    
        window.addEventListener('popstate', handleNavigation);
        return () => window.removeEventListener('popstate', handleNavigation);
    }, [isProfileComplete, isEditing]);

    useEffect(() => {
        const fetchUserData = async () => {
            const userId = auth.currentUser.uid;
            const userDoc = doc(db, 'users', userId);
            const docSnap = await getDoc(userDoc);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setUserData(data);
                setIsProfileComplete(data.isProfileComplete || false);
                setIsEditing(!(data.isProfileComplete));
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            const shouldPreventNavigation = !isProfileComplete && isEditing;
            if (shouldPreventNavigation) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isProfileComplete, isEditing]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData((prevData) =>
            ({ ...prevData, [name]: value }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = auth.currentUser.uid;

        try {
            const updatedUser = {...userData, isProfileComplete: true, email: auth.currentUser.email};
            const userDoc = doc(db, 'users', userId); 
            await setDoc(userDoc, updatedUser);
            alert('Profile updated successfully!');

            setIsEditing(false);
            setIsProfileComplete(true);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile.');
        }

    }

    const formatFieldName = (field) => {
        const specialCases = {
            'netId': 'net ID',
            'studentId': 'student ID',
            'firstName': 'first name',
            'lastName': 'last name',
            'email': 'email address',
        };
        
        if (specialCases[field]) {
            return specialCases[field];
        }
        
        return field
            .split(/(?=[A-Z])/)
            .map(word => word.charAt(0) + word.slice(1))
            .join(' ');
    };

    useEffect(() => {
        const fetchUserData = async () => {
            const userId = auth.currentUser?.uid;
            if (!userId) return;

            const userDoc = doc(db, 'users', userId);
            const docSnap = await getDoc(userDoc);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setUserData({
                    ...data,
                    email: auth.currentUser.email
                });
                setIsProfileComplete(data.isProfileComplete || false);
                setIsEditing(!(data.isProfileComplete));
            } else {
                // If no profile exists, initialize with the email from auth
                setUserData(prev => ({
                    ...prev,
                    email: auth.currentUser.email
                }));
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const cleanup = auth.onAuthStateChanged(async (user) => {
            if (!user && auth.currentUser === null) {
                // User was deleted, clean up their profile
                try {
                    const userId = auth.currentUser?.uid;
                    if (userId) {
                        await deleteDoc(doc(db, 'users', userId));
                    }
                } catch (error) {
                    console.error('error cleaning up user profile:', error);
                }
            }
        });

        return () => cleanup();
    }, []);

    const handleDeleteAccount = async () => {
        if (!auth.currentUser) {
            alert('no user is currently signed in');
            return;
        }

        const confirmDelete = window.confirm(
            'are you sure you want to delete your account? this action cannot be undone.'
        );

        if (confirmDelete) {
            try {
                const userId = auth.currentUser.uid;
                await deleteDoc(doc(db, 'users', userId));
                await deleteUser(auth.currentUser);
                
                alert('your account has been successfully deleted');
            } catch (error) {
                console.error('error deleting account:', error);
                
                if (error.code === 'auth/requires-recent-login') {
                    alert('please sign out and sign in again to delete your account.');
                } else {
                    alert('failed to delete account: ' + error.message);
                }
            }
        }
    };
    
    return (
        <div style={styles.container}>
            <h2 style={styles.header}>user profile</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                {['firstName', 'lastName', 'college', 'studentId', 'netId'].map((field) => (
                    <div key={field} style={styles.inputGroup}>
                        <label htmlFor={field}>{formatFieldName(field)}:</label>
                        <input
                            type="text"
                            id={field}
                            name={field}
                            value={userData[field] || ''}
                            onChange={handleChange}
                            required
                            disabled={!isEditing}
                            style={{
                                ...styles.input,
                                backgroundColor: isEditing ? '#fff' : '#f0f0f0'
                            }}
                        />
                    </div>
                ))}
                
                <div style={styles.inputGroup}>
                    <label htmlFor="email">email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={userData.email || ''}
                        disabled={true}
                        style={{
                            ...styles.input,
                            backgroundColor: '#f0f0f0'
                        }}
                    />
                </div>

                {isEditing ? (
                    <button type="submit" style={styles.submitButton}>
                        save profile
                    </button>
                ) : (
                    <button onClick={() => setIsEditing(true)} type="button" style={styles.editButton}>
                        edit profile
                    </button>
                )}
            </form>
            {/* New row for bottom buttons */}
            <div style={styles.bottomButtonRow}>
                <button onClick={handleSignOut} style={styles.signOutButton}>
                    sign out
                </button>
                <button
                    onClick={handleDeleteAccount}
                    style={{ ...styles.signOutButton, backgroundColor: '#dc3545' }}
                >
                    delete account
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '600px',
        margin: '60px auto',
        padding: '20px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        fontFamily: "'Inter', sans-serif",
        textAlign: 'left',
        transition: 'all 0.3s ease',
        fontSize: '14px'
    },
    header: {
        textAlign: 'center',
        marginBottom: '20px',
        fontSize: '22px',
        fontWeight: '700',
        color: '#333',
        borderBottom: '2px solid #6366f1',
        paddingBottom: '8px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    label: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#555'
    },
    input: {
        width: '100%',
        padding: '10px',
        fontSize: '14px',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        outline: 'none',
        transition: 'border-color 0.2s ease',
    },
    submitButton: {
        padding: '10px',
        backgroundColor: '#6366f1',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease, transform 0.3s ease',
    },
    editButton: {
        padding: '10px',
        backgroundColor: '#10b981',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease, transform 0.3s ease',
    },
    signOutButton: {
        padding: '10px',
        backgroundColor: '#e11d48',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease, transform 0.3s ease',
        flex: 1,
    },
    // New style for bottom button row
    bottomButtonRow: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '16px',
        marginTop: '40px'
    },
};



export default Profile;