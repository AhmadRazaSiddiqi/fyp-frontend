import React, { useState, useEffect } from "react"
import jwt_decode from "jwt-decode"
import "./UserAuth.css"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { 
    useToast, 
    useUserLogin
} from "../../index"
import API_BASE_URL from '../../config/api';

function Login()
{
    const { setUserLoggedIn }       = useUserLogin()
    const { showToast }             = useToast()

    const [userEmail    , setUserEmail]    = useState('')
    const [userPassword , setUserPassword] = useState('')

    const navigate = useNavigate()

    function loginUser(event)
    {
        event.preventDefault();
        axios.post(
            `${API_BASE_URL}/api/auth/login`,
            {
                email: userEmail,
                password: userPassword
            }
        )
        .then(res => {
            
            if(res.data.token)
            {
                localStorage.setItem('token',res.data.token)
                showToast("success","","Logged in successfully")
                setUserLoggedIn(true)
                navigate('/')
            }
            else
            {
                throw new Error("Error in user login")
            }

        })
        .catch(err=>{
            console.error('Login error:', err);
            
            // Handle specific error cases
            if (err.response?.status === 401) {
                showToast("error", "", "Invalid username or password. Please check your credentials.");
            } else if (err.response?.status === 404) {
                showToast("error", "", "User not found. Please check your username or create a new account.");
            } else if (err.response?.status === 400) {
                showToast("error", "", `Login failed: ${err.response?.data?.error || err.message}`);
            } else {
                showToast("error", "", "Error logging in user. Please try again");
            }
        })
    }

    return (
        <div className="user-auth-content-container">
            <form onSubmit={loginUser} className="user-auth-form">
                <h2>Login</h2>
                
                <div className="user-auth-input-container">
                    <label htmlFor="user-auth-input-email"><h4>Email</h4></label>
                    <input 
                        id="user-auth-input-email" 
                        className="user-auth-form-input" 
                        type="text" 
                        placeholder="Username" 
                        value={userEmail}
                        onChange={(event)=>setUserEmail(event.target.value)}
                        required/>
                </div>

                <div className="user-auth-input-container">
                    <label htmlFor="user-auth-input-password"><h4>Password</h4></label>
                    <input 
                        id="user-auth-input-password" 
                        className="user-auth-form-input" 
                        type="password" 
                        placeholder="Password" 
                        value={userPassword}
                        onChange={(event)=>setUserPassword(event.target.value)}
                        required/>
                </div>

                <div className="user-options-container">
                    <div className="remember-me-container">
                        <input type="checkbox" id="remember-me"/>
                        <label htmlFor="remember-me">Remember Me</label>
                    </div>
                    <div>
                        <Link to="#" className="links-with-blue-underline" id="forgot-password">
                            Forgot Password?
                        </Link>
                    </div>
                </div>

                <button 
                    type="submit" 
                    className="solid-success-btn form-user-auth-submit-btn"
                >
                        Login
                </button>

                <div className="new-user-container">
                    <Link to="/signup" className="links-with-blue-underline" id="new-user-link">
                        Create new account &nbsp; 
                    </Link>
                </div>

            </form>
        </div>
    )
}

export { Login }