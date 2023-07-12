import { useEffect, useState } from "react";
import { FormLabelAndInput } from "./quote";
import axios from "axios";

export default function Admin() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [username, setUsername] = useState(null);
    const [password, setPassword] = useState(null);
    const [daysAndHours, setDaysAndHours] = useState([]);
    const [days, setDays] = useState([]);
    const [buttonOpen, setButtonOpen] = useState(false);
    console.log(days);

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

    const handleButtonClick = () => {
        setButtonOpen(!buttonOpen);
    }

    useEffect(() => {
        const weekdays = []
        const fetchTimes = async () => {
            const results = await fetch(`http://${import.meta.env.VITE_IP_ADDRESS}/api/business-hours`);
            const daysAndTimes = await results.json();
            daysAndTimes.forEach(dayObj => {
                const day = Object.keys(dayObj)[0];
                weekdays.push(day);

            })
            setDays(weekdays)
            setDaysAndHours(daysAndTimes);
        }

        fetchTimes();
    }, []);

    return (
        <div id='admin-body'>
            {!loggedIn? 
                
                    <section id='navigation-section'>
                        <div id='hours-setter-wrapper'>
                            <h2 id='hours-header'>Hours</h2>
                            <div id='weekday-setter-wrapper'>
                                <label htmlFor='day' className='day-selector-label'>
                                    Day
                                </label>
                                <button onClick={handleButtonClick}
                                        className={`days-toggle ${buttonOpen}`}
                                >
                                    {!buttonOpen? 'Click to Open' : 'Click to Close'}
                                </button>
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

function DaysAndTimesList(props) {
    const {day, times} = {...props};
    return (
        <>
            <h2>{day}</h2>
            {
                times.map(time => {
                    return (
                        <li>{time}</li>
                    );
                })
            }
        </>
    );
}