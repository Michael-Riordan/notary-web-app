import { useState } from "react";
import { FormLabelAndInput } from "./quote";
import axios from "axios";

export default function Admin() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [username, setUsername] = useState(null);
    const [password, setPassword] = useState(null);
    const [weekdayHours, setWeekdayHours] = useState('');

    const possibleWeekdayHours = [
        '6:00pm', '6:30pm', '7:00pm', '7:30pm', '8:00pm', '8:30pm', '9:00pm'
    ]

    const handleInputChange = (event) => {
        if (event.target.className === 'input username') {
            setUsername(event.target.value);
        } else {
            setPassword(event.target.value);
        }
    }

    const validateCredentials = async (event) => {
        event.preventDefault();
        try {
             const response = await axios.post(`http://${import.meta.env.VITE_IP_ADDRESS}/credentials`, {
                username,
                password,
            });
            if (response.status === 200) {
                console.log('Login Successful')
                setLoggedIn(true);
            } else {
                console.log('Login failed:', response);
            }
        } catch (error) {
            console.log('Error: ', error.response.data);
        }
    }

    return (
        <div id='admin-body'>
            {loggedIn? 
                
                    <section id='navigation-section'>
                        <div id='hours-setter-wrapper'>
                            <h2 id='hours-header'>Hours</h2>
                            <div id='weekday-hours-wrapper'>
                                <h3 id='weekday-hours'>Mon-Fri</h3>
                                <div id='weekday-setter-wrapper'>
                                    <p id='hours-list'>Current Set Hours: {weekdayHours}</p>
                                    <p id='current-hours'>
                                        Current Options: <br/>
                                        {possibleWeekdayHours.join(', ')}
                                    </p>
                                    
                                </div>
                            </div>
                        </div>
                        <div id='blocked-dates-setter-wrapper'>
                            <h2>Blocked Dates</h2>
                        </div>
                        <div id='blocked-times-setter-wrapper'>
                            <h2>Blocked Times</h2>
                        </div>
                    </section>
                
                :   
                <form id='login-form-wrapper' onSubmit={validateCredentials}>
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