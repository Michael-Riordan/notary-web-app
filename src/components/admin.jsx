import { useEffect, useState } from "react";
import { FormLabelAndInput } from "./quote";
import axios from "axios";
import moment from "moment";

export default function Admin() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [username, setUsername] = useState(null);
    const [password, setPassword] = useState(null);
    const [daysAndHours, setDaysAndHours] = useState([]);
    const [days, setDays] = useState([]);
    const [selectedDay, setSelectedDay] = useState(null);
    const [formattedDay, setFormattedDay] = useState(null);
    const [buttonOpen, setButtonOpen] = useState(false);
    const [addedHour, setAddedHour] = useState('');
    const [hourAdded, setHourAdded] = useState(null);
    const [deletedHour, setDeletedHour] = useState('');
    const [hourDeleted, setHourDeleted] = useState(null);
    const [suffix, setSuffix] = useState('am');
    const [blockedDates, setBlockedDates] = useState([]);
    const [chosenBlockedStartDate, setChosenBlockedStartDate] = useState('');
    const [chosenBlockedEndDate, setChosenBlockedEndDate] = useState('')
    const [loginAttempted, setLoginAttempted] = useState(false);
    const [endDateGreater, setEndDateGreater] = useState(null);
    const [validDate, setValidDate] = useState(null);
    const [blockedTimesAndDate, setBlockedTimesAndDate] = useState([]);

    const sort_by_hour = (time1, time2) => {
        let hour1 = parseInt(time1.slice(0, -5));
        let hour2 = parseInt(time2.slice(0, -5));
        let minute1 = parseInt(time1.slice(-7, -5));
        let minute2 = parseInt(time2.slice(-7, -5));
        const period1 = time1.slice(-2);
        const period2 = time2.slice(-2);

        if (period1 == 'pm' && hour1 !== 12) {
            hour1 += 12;
        }

        if (period2 == 'pm' && hour2 !== 12) {
            hour2 += 12;
        }

        if (hour1 === hour2) {
            return minute1 - minute2;
        }

        return hour1 - hour2;
    };

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
            setLoginAttempted(true);
        }
    }

    const handleButtonClick = () => {
        setButtonOpen(!buttonOpen);
    }

    const handleDaySelection = (event) => {
        setSelectedDay(event.target.textContent);
        setButtonOpen(!buttonOpen);
        setFormattedDay(event.target.textContent === 'Tue'? 
        event.target.textContent + 'sday' :
        event.target.textContent === 'Wed'? 
        event.target.textContent + 'nsday':
        event.target.textContent === 'Thu'? 
        event.target.textContent + 'rsday':
        event.target.textContent === 'Sat'? 
        event.target.textContent + 'urday':
        event.target.textContent + 'day')
    }

    const handleEditorChange = (event) => {
        event.target.id === 'add-hours'? setAddedHour(event.target.value) : setDeletedHour(event.target.value);
    }
    
    const validateTimeFormat = (time) => {
        const pattern = /^(1[0-2]|0?[1-9]):(00|30)$/;
        return pattern.test(time);
    }

    const validateDateFormat = (date) => {
        const pattern = /^[A-Za-z]{3} \d{1,2} \d{4}$/;
        return pattern.test(date);
    }

    const updateBlockedDates = (event) => {
        let datesToAddOrRemove = [];
        if (validateDateFormat(chosenBlockedStartDate) && validateDateFormat(chosenBlockedEndDate)) {
            const chosenStartMoment = moment(chosenBlockedStartDate, 'MMM D YYYY');
            const chosenEndMoment = moment(chosenBlockedEndDate, 'MMM D YYYY');
            chosenEndMoment >= chosenStartMoment? setEndDateGreater(true) : setEndDateGreater(false);
            chosenStartMoment.isValid() && chosenEndMoment.isValid()? setValidDate(true) : setValidDate(false);
            if (chosenEndMoment >= chosenStartMoment) {
                if (chosenEndMoment.format('MMM D YYYY') === chosenStartMoment.format('MMM D YYYY')) {
                    datesToAddOrRemove.push(chosenStartMoment.format('MMM D YYYY'));
                } else {
                    datesToAddOrRemove.push(chosenStartMoment.format('MMM D YYYY') + '-' + chosenEndMoment.format('MMM D YYYY'))
                }
                if (event.target.id === 'confirm-dates-button') {
                    sendDatesUpdateRequest(datesToAddOrRemove, `updateBlockedDates`);
                } else if (event.target.id === 'remove-dates-button') {
                    sendDatesUpdateRequest(datesToAddOrRemove, 'deleteSelectedDates');
                }
            }
        }
    }

    const updateTime  = (path) => {
        let hourToUpdate;
        path === 'delete-hours'? hourToUpdate = deletedHour : hourToUpdate = addedHour;
        if (validateTimeFormat(hourToUpdate)) {
            const hourToChange = hourToUpdate + suffix
            let dayToUpdate;
            for (let i = 0; i<7; i++) {
                if (daysAndHours[i][selectedDay] != null) {
                    dayToUpdate = daysAndHours[i][selectedDay];
                }
            }
            if (path === 'delete-hours'? dayToUpdate.includes(hourToChange) : !dayToUpdate.includes(hourToChange)) {
                fetch(`http://${import.meta.env.VITE_IP_ADDRESS}/${path}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({day: selectedDay, time: hourToChange}),
                })
                    .then(response => response.json())
                    .then(data => {
                        setDaysAndHours(data);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    })
                path === 'delete-hours'? setHourDeleted(true) : setHourAdded(true);
            } else {
                path === 'delete-hours'? setHourDeleted(false) : setHourAdded(false);
            }
        } else {
            path === 'delete-hours'? setHourDeleted(false) : setHourAdded(false);
        }
    };

    const sendDatesUpdateRequest = (blockedDates, path) => {
        fetch(`http://${import.meta.env.VITE_IP_ADDRESS}/${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ blockedDates: blockedDates }),
        })
          .then(res =>
            res.json())
          .then(data => {
            setBlockedDates(data);
        })
           .catch(error => {
            console.error('Error:', error);
        });
    }

    const changeSuffix = () => {
        suffix === 'am'? setSuffix('pm') : setSuffix('am');
    }

    const handleDatesInputChange = (event) => {
        event.target.className === 'date-input start'? setChosenBlockedStartDate(event.target.value) : setChosenBlockedEndDate(event.target.value);
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

    useEffect(() => {
        const fetchBlockedDates = async () => {
            const results = await fetch(`http://${import.meta.env.VITE_IP_ADDRESS}/api/blocked-dates`);
            const blockedDates = await results.json();
            setBlockedDates(blockedDates);
        }
        fetchBlockedDates();
    }, []);

    return (
        <div id='admin-body'>
            {loggedIn? 
                
                    <section id='navigation-section'>
                        <div id='hours-setter-wrapper'>
                            <h2 id='hours-header'>Hours</h2>
                            <div id='weekday-setter-wrapper'>
                                <label htmlFor='day' className='day-selector-label'>
                                    Day of Week
                                </label>
                                <button onClick={handleButtonClick}
                                        className={`days-toggle ${buttonOpen? 'open' : 'closed'}`}
                                >
                                    {!buttonOpen && selectedDay === null? 'Select Day' : selectedDay != null? `${selectedDay}` : 'Select Day'}
                                </button>
                                <ul id='days-list'>
                                    {
                                        days.map((day, index) => {
                                            return (
                                                <li className='list-item-day'
                                                    key={index}
                                                    onClick={handleDaySelection}
                                                >
                                                    {day}
                                                </li>
                                            );
                                        })
                                    }
                                </ul>
                                <div id='current-hours-wrapper'>
                                    <h3 id='current-hours-header'>{selectedDay == null ? 'Select a Day to View Hours' :
                                        `Current ${formattedDay} Hours`}
                                    </h3>
                                    <p id='hours-list'> 
                                        {
                                            daysAndHours.map((day, index) => {
                                                 if (Object.keys(daysAndHours[index]).includes(selectedDay)) {
                                                    const sortedHours = daysAndHours[index][selectedDay].sort(sort_by_hour);
                                                    return sortedHours.join(', ');
                                                 }
                                            })
                                        }
                                    </p>
                                </div>
                                <div id='hours-editor-wrapper'>
                                    <h3 id='hours-editor-header'>
                                        {selectedDay == null? 'Select a Day to Edit Hours' : `Edit ${formattedDay} Hours`}
                                    </h3> 
                                    {selectedDay != null? 
                                    <AddAndDeleteComponents 
                                        formattedDay={formattedDay} 
                                        useCase='hours'
                                        handleEditorChange={handleEditorChange}
                                        addedHour={addedHour}
                                        deletedHour={deletedHour}
                                        updateTime={updateTime}
                                        changeSuffix={changeSuffix}
                                        suffix={suffix}
                                        hourAdded={hourAdded}
                                        hourDeleted={hourDeleted}
                                    /> :
                                    ''
                                    }                              
                                </div>
                            </div>
                        </div>
                        <div id='blocked-dates-setter-wrapper'>
                            <h2 id='blocked-dates-setter-header'>Blocked Dates</h2>
                            <h3 id='dates-list-header'>Vacation Time/Days Off</h3>
                            <div id='blocked-dates-setter'>
                                    <p id='dates-list'>
                                        {blockedDates.map((blocked, i) => {
                                            return blocked['Blocked'].join(' ');
                                        })}
                                    </p>
                                    <BlockedDatesSetter 
                                        handleDatesInputChange={handleDatesInputChange}
                                        updateBlockedDates={updateBlockedDates}
                                    />
                                    {validDate == null? '' : validDate? '' : <p className='date-error'>Please enter a valid date.</p>}
                                    {endDateGreater == null? '' : endDateGreater? '' : <p className='date-error'>The end date must be the same as or after the start date.</p>}
                            </div>
                        </div>
                        <div id='blocked-times-setter-wrapper'>
                            <h2 id='blocked-times-setter-header'>Blocked Times</h2>
                            <h3 id='blocked-times-list-header'>Blocked Times for Date</h3>
                            <div id='blocked-times-setter'>
                                <p id='blocked-times-list'>
                                    {
                                        blockedTimesAndDate
                                    }
                                </p>
                                <BlockedTimesSetter />
                            </div>
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
                        placeholder='username'
                        handleInputChange={handleInputChange}
                    />
                    <FormLabelAndInput
                        label='Password'
                        name='password'
                        type='password'
                        value={password}
                        required={true}
                        placeholder='password'
                        handleInputChange={handleInputChange}
                    />
                    <button
                        id='login-button'
                        type='submit'
                    >
                        Log In
                    </button>
                    {loginAttempted? <p id='login-failed'>Incorrect Username/Password. <br/> Please Try Again</p> : ''}
                </form>
            }
        </div>
    );
}

function AddAndDeleteComponents(props) {
    const {formattedDay, useCase, handleEditorChange, addedHour, deletedHour, updateTime, 
           changeSuffix, suffix, hourAdded, hourDeleted} = {...props};
    return (
        <>
            <label htmlFor='add-time' id={`add-${useCase}-label`}>Add Time to {formattedDay} Hours</label>
            <div className='input-and-suffix-wrapper'>
                <input type='text' 
                       id={`add-${useCase}`}
                       onChange={handleEditorChange}
                       value={addedHour}
                />
                <button className='am-pm'
                        onClick={changeSuffix}
                >
                    {suffix}
                </button>
            </div>
            <button id='add-button'
                    onClick={() => updateTime('update-hours')}
            >
                Add
            </button>
            <p className={`hours-edit-status ${hourAdded}`}>{hourAdded? 'Hour Added Successfully' : hourAdded == null? '' : 
                (<>Error: Could Not Add Hour. <br/> Check Time Format, and That the Time Slot Is Not Already In Current Hours</>)}</p>
            <br/>
            <label htmlFor='delete-time' id= {`delete-${useCase}-label`}>
                Delete Time from {formattedDay} Hours
            </label>
            <div className='input-and-suffix-wrapper'>
                <input id={`delete-${useCase}`} 
                       type='text'
                       onChange={handleEditorChange}
                       value={deletedHour}
                />
                <button className='am-pm'
                        onClick={changeSuffix}
                >
                    {suffix}
                </button>
            </div>
            <button id='delete-button'
                    onClick={() => updateTime('delete-hours')}
            >
                Delete
            </button>
            <p className={`hours-edit-status ${hourDeleted}`}>
                {hourDeleted? 'Hour Deleted Successfully' : hourDeleted == null? '' : (<>Error: Could Not Delete Hour. <br/>
                 Check Time Format, and That the Time Slot Exists In Current Hours</>)}
            </p>
        </>
    )
}

function BlockedDatesSetter(props) {
    const {handleDatesInputChange, updateBlockedDates} = {...props};
    return (
        <>
            <label htmlFor='start-date' className='blocked-date-label'>
                Start Date
            </label>
            <input type='text' 
                   className='date-input start' 
                   placeholder="Aug 13 2023" 
                   onChange={handleDatesInputChange}
            />
            <label htmlFor='end-date' 
                   className='blocked-date-label'
            >
                End Date
            </label>
            <input type='text' 
                   className='date-input end' 
                   placeholder="Aug 20 2023" 
                   onChange={handleDatesInputChange}
            />
            <div id='blocked-dates-buttons-wrapper'>
                <button id='confirm-dates-button'
                        onClick={updateBlockedDates}
                >
                    Add Blocked Dates
                </button>
                <button id='remove-dates-button'
                        onClick={updateBlockedDates}>Remove Blocked Dates
                </button>
            </div>
        </>
    );
}

function BlockedTimesSetter(props) {
    return (
        <>
            <label htmlFor='date-input' id='date-input-label'>
                Date
            </label>
            <input type='text' id='date-input' placeholder='Aug 13 2023'/>
            <label htmlFor='time-to-block' id='time-to-block-label'>
                Time to Block
            </label>
            <input type='text' id='time-to-block-input' placeholder='7:30pm' />
        </>
    );
}