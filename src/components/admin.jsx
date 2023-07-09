import { useState } from "react";
import { FormLabelAndInput } from "./quote";

export default function Admin() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('');

    const handleInputChange = (event) => {
        if (event.target.className === 'input username') {
            setUsername(event.target.value);
        } else {
            setPassword(event.target.value);
        }
    }

    return (
        <div id='admin-body'>
            {loggedIn? 
                
                    <h1>Welcome, LRMobileNotary Associate</h1>
                
                :   
                <form id='login-form-wrapper'>
                    <h2 id='login-form-header'>Admin Login</h2>
                    <FormLabelAndInput 
                        label='Username'
                        name='username'
                        type='text'
                        value={username}
                        required={true}
                        handleInputChange={handleInputChange}
                    />
                    <FormLabelAndInput
                        label='Password'
                        name='password'
                        type='password'
                        value={password}
                        required={true}
                        handleInputChange={handleInputChange}
                    />
                    <button
                        id='login-button'
                        type='submit'
                    >
                        Log In
                    </button>
                </form>
            }
        </div>
    );
}