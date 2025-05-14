import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { getFunctions, httpsCallable } from 'firebase/functions';
import { loadStripe } from '@stripe/stripe-js';

// const functions = require("firebase-functions");
// const stripePromise = loadStripe(functions.config().stripe.secret_key);
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_SECRET_KEY);

const Cart = () => {
    // const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [scheduledTime, setScheduledTime] = useState("");
    const [availableTimes, setAvailableTimes] = useState([]);

    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            setCart(JSON.parse(storedCart));
        }
    }, []);

    useEffect(() => {
        const generateValidTimeSlots = () => {
            const now = new Date();
            const storeDays = [2, 3, 4]; // Tue, Wed, Thu
            const openHour = 18.0; // 6:00 PM
            const closeHour = 22.0; // 10:00 PM
            const interval = 15;
    
            const slots = [];
    
            for (let i = 0; i < 7; i++) {
                const date = new Date(now);
                date.setDate(now.getDate() + i);
                const day = date.getDay();
                if (!storeDays.includes(day)) continue;
    
                const today = i === 0;
                const nowDecimal = now.getHours() + now.getMinutes() / 60;
                let startTime = openHour;
    
                if (today && nowDecimal > openHour) {
                    startTime = Math.max(nowDecimal, openHour);
                }
    
                for (let time = startTime; time < closeHour; time += interval / 60) {
                    const hours = Math.floor(time);
                    const minutes = Math.round((time - hours) * 60);
                    const slot = new Date(date);
                    slot.setHours(hours);
                    slot.setMinutes(minutes);
                    slot.setSeconds(0);
                    slot.setMilliseconds(0);
    
                    if (slot > now) {
                        slots.push({
                            iso: slot.toISOString(), // Used for backend
                            label: slot.toLocaleString('en-US', {
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                            }) // Used for display
                        });
                    }
                }
            }
    
            return slots;
        };
    
        setAvailableTimes(generateValidTimeSlots());
    }, []);
    


    const computeItemPrice = (item) => {
        let basePrice = 4.00;
    
        if (item.options.size === 'large') {
            basePrice += 0.50;
        }
    
        const extraFlavors = item.options.flavors.length > 1 ? (item.options.flavors.length - 1) * 0.50 : 0;
        const extraToppings = item.options.toppings.length > 1 ? (item.options.toppings.length - 1) * 0.50 : 0;
    
        const unitCost = basePrice + extraFlavors + extraToppings;
    
        return unitCost * Number(item.options.quantity);
    };
    

    const totalPrice = cart.reduce((sum, item) => sum + computeItemPrice(item), 0);

    const removeItem = (index) => {
        const updatedCart = cart.filter((_, i) => i !== index);
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const handleCheckout = async () => {
        if (!scheduledTime) {
            alert("Please select a pickup time");
            return;
        }
    
        try {
            const stripe = await stripePromise;
    
            const response = await fetch(
                process.env.REACT_APP_FETCH_URL,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        cart,
                        scheduledTime,
                        successUrl: `${window.location.origin}/success`,
                        cancelUrl: `${window.location.origin}/cart`,
                    }),
                }
            );
    
            if (!response.ok) {
                throw new Error("Failed to create Stripe checkout session");
            }
    
            const data = await response.json();
    
            if (data.sessionId) {
                const result = await stripe.redirectToCheckout({
                    sessionId: data.sessionId,
                });
    
                if (result.error) {
                    alert(result.error.message);
                }
            } else {
                alert("Failed to initiate Stripe checkout. Please try again.");
            }
        } catch (error) {
            console.error("Error during checkout:", error);
            alert("There was an error processing your checkout. Please try again.");
        }
    };
      

    const styles = {
        container: {
            fontFamily: "'Inter', sans-serif",
            backgroundColor: "#f2f4f7",
            padding: "20px",
            color: "#333",
            textAlign: "center",
            minHeight: "100vh"
        },
        cartContainer: {
            backgroundColor: "#fff",
            margin: "30px auto",
            padding: "20px",
            maxWidth: "600px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            borderRadius: "10px",
            textAlign: "left"
        },
        heading: {
            fontSize: "2rem",
            fontWeight: "600",
            marginBottom: "20px"
        },
        cartItem: {
            borderBottom: "1px solid #e5e7eb",
            padding: "10px 0"
        },
        itemDetails: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
        },
        itemInfo: {
            display: "flex",
            flexDirection: "column",
            gap: "4px"
        },
        itemName: {
            fontSize: "1.1rem",
            fontWeight: "600"
        },
        itemExtra: {
            fontSize: "0.9rem",
            color: "#555"
        },
        removeButton: {
            backgroundColor: "#f87171",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "4px 8px",
            cursor: "pointer",
            fontSize: "0.8rem",
            marginLeft: "10px",
            transition: "background-color 0.2s ease"
        },
        total: {
            fontSize: "1.25rem",
            fontWeight: "600",
            textAlign: "right",
            marginTop: "20px"
        },
        checkoutButton: {
            padding: "12px 24px",
            backgroundColor: "#6366f1",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "600",
            width: "100%",
            marginTop: "20px",
            transition: "background-color 0.2s ease",
            outline: "none"
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>your cart</h1>
            <div style={styles.cartContainer}>
                {cart.length === 0 ? (
                    <p>your cart is empty.</p>
                ) : (
                    cart.map((item, index) => (
                        <div key={index} style={styles.cartItem}>
                            <div style={styles.itemDetails}>
                                <div style={styles.itemInfo}>
                                    <div style={styles.itemName}>
                                        {item.drink} (x{item.options.quantity})
                                    </div>
                                    <div style={styles.itemExtra}>
                                        size: {item.options.size.charAt(0) + item.options.size.slice(1)}
                                    </div>
                                    <div style={styles.itemExtra}>
                                        sugar: {item.options.sugar}% | ice: {item.options.ice}
                                    </div>
                                    {item.options.flavors.length > 0 && (
                                        <div style={styles.itemExtra}>
                                            flavors: {item.options.flavors.join(', ')}
                                        </div>
                                    )}
                                    {item.options.toppings.length > 0 && (
                                        <div style={styles.itemExtra}>
                                            toppings: {item.options.toppings.join(', ')}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    ${computeItemPrice(item).toFixed(2)}
                                    <button 
                                        onClick={() => removeItem(index)}
                                        style={styles.removeButton}
                                    >
                                        remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                {cart.length > 0 && (
                    <>
                        <label style={{ ...styles.itemExtra, marginTop: '20px', display: 'block' }}>
                            schedule pick up time:
                        </label>
                        <select
                            value={scheduledTime}
                            onChange={(e) => {
                                setScheduledTime(e.target.value);
                                localStorage.setItem('scheduledTime', e.target.value);
                            }}
                            style={{
                                width: '100%',
                                padding: '10px',
                                marginTop: '6px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '0.95rem'
                            }}
                        >
                            <option value="">select a time</option>
                            {availableTimes.map(({ iso, label }) => (
                                <option key={iso} value={iso}>{label}</option>
                            ))}
                        </select>


                        <div style={styles.total}>
                            Total: ${totalPrice.toFixed(2)}
                        </div>
                        <button style={styles.checkoutButton}
                            onClick={handleCheckout}
                            disabled={!scheduledTime}
                        >
                            {scheduledTime ? 'proceed to checkout' : 'select pickup time to checkout'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Cart;