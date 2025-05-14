import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db} from './Login';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';


const Success = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const sendOrderToFirestore = async () => {
            // const auth = auth;
            // const db = db;
            const user = auth.currentUser;
    
            if (!user) {
                console.error('No user is currently signed in. (should never happen)');
                // navigate('/login');
                return;
            }
    
            const storedCart = localStorage.getItem('cart');
            const scheduledTime = localStorage.getItem('scheduledTime');
    
            if (!storedCart || !scheduledTime) return;

            if (storedCart && scheduledTime){
                const orderData = {
                    userId: user.uid,
                    cart: JSON.parse(storedCart),
                    scheduledTime,
                    status: 'pending',
                    createdAt: serverTimestamp()
                };
        
                try {
                    await addDoc(collection(db, 'orders'), orderData);
                } catch (error) {
                    console.error('Failed to save order:', error);
                }
            }

            localStorage.removeItem('cart');
            localStorage.removeItem('scheduledTime');
        };
    
        sendOrderToFirestore();
    }, []);
    

    return (
        <div style={{
            textAlign: 'center',
            padding: '50px 20px',
            maxWidth: '600px',
            margin: '0 auto'
        }}>
            <h1>order confirmed!</h1>
            <p>thank you for your order. your drinks will be ready at your selected pickup time.</p>
            <button
                onClick={() => navigate('/')}
                style={{
                    padding: '12px 24px',
                    backgroundColor: '#6366f1',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginTop: '20px'
                }}
            >
                return to home
            </button>
        </div>
    );
};

export default Success;