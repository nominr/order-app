import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { auth, handleSignOut } from '../pages/Login'; 
import './HomeBar.css'
import logo from '../images/teanook_logo.jpg';

export function HomeBar() {
    const navigate = useNavigate()
    const [isMenu, setMenu] = useState("false")
    
    const navigateTo = (link) => {
        navigate(link)
        setMenu("false")
    }

    const toggleMenu = () => {
        setMenu(!isMenu)
    }

    const barSegments = [
        {link: '/home', title: 'home'},
        {link: '/cart', title: 'cart'},
        // {link: '/orders', title: 'Orders'},
        {link: '/profile', title: 'profile'},   
        // {link: './signout', title: 'Sign Out'}                  
    ]

    return (
        <nav className='home-bar'>
            <div className='logo' onClick={() => navigateTo('/')}>
                
                {!auth.currentUser && (
                    <img src = {logo} alt='Teanook Logo' style={{ height: '50px', cursor: 'pointer' }} />
                )}

                {auth.currentUser && (
                    <li onClick={handleSignOut} style={{ color: 'red', cursor: 'pointer', listStyleType: 'none' }}>
                        sign out
                    </li>
                )}
                
            </div>

            <button className='menu-toggle' onClick={toggleMenu}>☰</button>

            <ul className={`nav-links ${isMenu ? 'open' : ''}`}>
                {barSegments.map((segment, index) => (
                    <li key={index} onClick={() => navigateTo(segment.link)}>
                        {segment.title}
                    </li>
                ))}

                {/* <li onClick={handleSignOut} style={{ color: 'red', cursor: 'pointer' }}>
                    Sign Out
                </li> */}
            </ul>
        </nav>
    )
}