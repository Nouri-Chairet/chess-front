import React, { useState } from 'react';
import { loginUser } from '../utils/api'; // Adjust the import path accordingly
import '../styles/login.css';
import img from '../assets/1vs1.png';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const data = await loginUser(username, password);
            localStorage.setItem('token', data.token); 
            setSuccessMessage('Login successful!');
            navigate('/Home'); 
        } catch (error) {
            setErrorMessage(error?.response?.data?.error || 'An error occurred.'); 
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h1 className='welcome-login'>Welcome to Chessi.com </h1>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {errorMessage && <p style={{color:'red',fontSize:'16px',fontWeight:'500',textAlign:"center",marginBottom:"17px"}}>{errorMessage}</p>}
                    {successMessage && <p style={{color:'green',fontSize:'16px',fontWeight:'500',textAlign:"center",marginBottom:"17px"}}>{successMessage}</p>}
                    <button type="submit" className="login-button">Login</button>
                </form>
                <div className="social-login">
                    <p className='txt'>Or login with</p>
                    <button className="google-button" disabled>Google (coming soon)</button>
                    <button className="facebook-button" disabled>Facebook (coming soon)</button>
                </div>
            </div>
            <div className="login-image">
                <img src={img} alt="Chess" />
            </div>
        </div>
    );
};

export default Login;
