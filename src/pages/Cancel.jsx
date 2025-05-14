import React from 'react';
import { useNavigate } from 'react-router-dom';

const Cancel = () => {
    const navigate = useNavigate();
    
    return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
    <h1>payment unsuccessful</h1>
    <p>please try again later</p>
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
)};

export default Cancel;