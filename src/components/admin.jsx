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
    const [chosenBlockedDateForTime, setChosenBlockedDateForTime] = useState(' ');
    const [chosenTimeToBlock, setChosenTimeToBlock] = useState(' ');
    const [chosenBuffer, setChosenBuffer] = useState(' ');
    const [loginAttempted, setLoginAttempted] = useState(false);
    const [endDateGreater, setEndDateGreater] = useState(null);
    const [validDate, setValidDate] = useState(null);
    const [blockedTimesAndDate, setBlockedTimesAndDate] = useState([]);
    const [timeBlockValidity, setTimeBlockValidity] = useState(null);
    const [pendingAppointments, setPendingAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState('');
    const [selectedAppointmentId, setSelectedAppointmentId] = useState('');
    const [appointments, setAppointments] = useState([]);
    const [pendingAppointmentAccepted, setPendingAppointmentAccepted] = useState(false);

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
             const response = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/credentials`, {
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
        event.target.textContent + 'nesday':
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
                fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/${path}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                    },
                    body: JSON.stringify({day: selectedDay, time: hourToChange}),
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
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
        fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/${path}`, {
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

    const handleBlockerInputChange = (event) => {
        event.target.className === 'date-input start' ? setChosenBlockedStartDate(event.target.value) : 
        event.target.className === 'date-input end' ? setChosenBlockedEndDate(event.target.value) :
        event.target.className === 'date-input date-for-time' ? setChosenBlockedDateForTime(event.target.value) :
        event.target.className === 'date-input time' ? setChosenTimeToBlock(event.target.value) :
        setChosenBuffer(event.target.value);
    }

    const updateBlockedTime = (event) => {
        let path;

        if (validateTimeFormat(chosenTimeToBlock) && validateDateFormat(chosenBlockedDateForTime) && moment(chosenBlockedDateForTime, 'MMM D YYYY').isValid()) {
            const timeToBlock = chosenTimeToBlock + suffix;
            event.target.id === 'confirm-dates-button'? path='updateBlockedTime' : path='deleteBlockedTime';

            if (path != null) {
                fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/${path}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({date: chosenBlockedDateForTime, time: timeToBlock, buffer: chosenBuffer}),
                })
                  .then(res => 
                    res.json())
                  .then(data => {
                    setBlockedTimesAndDate(data);
                  })
                  .catch(error => {
                    console.error(error);
                  })
            }
        } else {
            setTimeBlockValidity(false);
        }
    }

    const handleAppointmentSelection = (event, appointmentId) => {
        setSelectedAppointment(event.target.textContent);
        setSelectedAppointmentId(appointmentId);
    }

    const updateAppointmentStatus = () => {
        const newStatus = 'Accepted';
        
        axios.put(`${import.meta.env.VITE_SERVER_DOMAIN}/updateAppointment/${selectedAppointmentId}`, { status: newStatus})
             .then((response) => {
                console.log(response.data.message);
             })
             .catch((error) => {
                console.error('Axios error:', error);
             });
    }

    const removeFromPending = () => {
        const splitAppointment = selectedAppointment.split(' ');
        const name = splitAppointment.slice(0, 1).join(' ').replace(':', '');
        const appointment = splitAppointment.slice(1, 8).join(' ');

        fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/removePendingAppointment`, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json', 
            },
            body: JSON.stringify({name: name, appointment: appointment, appointmentId: selectedAppointmentId})
        })
          .then(res => res.json())
          .then(data => {
            setPendingAppointments(data);
            setSelectedAppointment('');
          })
          .catch(error => {
            console.error(error);
          })
        
        updateAppointmentStatus();
    }

    const updatePendingAppointments = async (event) => {

        if (event.target.textContent === 'Reject Appointment') {
            removeFromPending();
            await axios.delete(`${import.meta.env.VITE_SERVER_DOMAIN}/deleteAppointment/${selectedAppointmentId}`)
        } else {
            setPendingAppointmentAccepted(true);
            removeFromPending();
        }
    }

    useEffect(() => {
        const weekdays = []
        const fetchTimes = async () => {
            const results = await fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/api/business-hours`);
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
            const results = await fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/api/blocked-dates`);
            const blockedDates = await results.json();
            setBlockedDates(blockedDates);
        }
        fetchBlockedDates();
    }, []);

    useEffect(() => {
        const fetchBlockedDateAndTime = async () => {
            const results = await fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/api/blocked-time-for-date`)
            const blockedTimeForDate = await results.json();
            setBlockedTimesAndDate(blockedTimeForDate);
        }
        fetchBlockedDateAndTime();
    }, []);

    useEffect(() => {
        const fetchPendingAppointments = async () => {
            const results = await fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/api/pending-appointments`)
            const appointments = await results.json();
            setPendingAppointments(appointments)
        }
        fetchPendingAppointments();
    }, []);

    useEffect(() => {
        const getAppointments = async () => {
            await axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/appointments`)
                .then((response) => response.data)
                .then(response => {
                    setAppointments(response)});
        }
        getAppointments();
        let pendingIds = [];
        if (pendingAppointments.length > 0) {
            pendingAppointments.forEach(appointment => {
                pendingIds.push(appointment.appointmentId);
            })
        };

        appointments.forEach(appointment => {
            if (pendingAppointments.length === 0 && pendingAppointmentAccepted === false && appointment.status !== 'Accepted') {
                console.log('deleting first if check reached')
                axios.delete(`${import.meta.env.VITE_SERVER_DOMAIN}/deleteAppointment/${appointment.appointmentid}`)  
            } else {
                if (!pendingIds.includes(appointment.appointmentid) && pendingAppointmentAccepted === false && appointment.status !== 'Accepted') {
                    console.log(pendingIds, appointment.appointmentid);
                    axios.delete(`${import.meta.env.VITE_SERVER_DOMAIN}/deleteAppointment/${appointment.appointmentid}`)  
                }
            }
        })
    }, [pendingAppointments])

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
                                    <CustomInputAndLabel 
                                        className='blocked-date-label'
                                        onChange={handleBlockerInputChange}
                                        placeholder='Aug 13 2023'
                                        identifier='start'
                                        name='start-date'
                                        label='Start Date'
                                    />
                                    <CustomInputAndLabel 
                                        className='blocked-date-label'
                                        onChange={handleBlockerInputChange}
                                        placeholder='Aug 20 2023'
                                        identifier='end'
                                        name='end-date'
                                        label='End Date'
                                    />
                                    <div id='blocked-dates-buttons-wrapper'>
                                        <CustomButton 
                                            onClick={updateBlockedDates}
                                            id='confirm-dates-button'
                                            label='Add Blocked Dates'
                                        />
                                        <CustomButton
                                            onClick={updateBlockedDates}
                                            id='remove-dates-button'
                                            label='Remove Blocked Dates'
                                        />
                                    </div>
                                    {validDate == null? '' : validDate? '' : <p className='date-error'>Please enter a valid date.</p>}
                                    {endDateGreater == null? '' : endDateGreater? '' : <p className='date-error'>The end date must be the same as or after the start date.</p>}
                            </div>
                        </div>
                        <div id='blocked-times-setter-wrapper'>
                            <h2 id='blocked-times-setter-header'>Blocked Times</h2>
                            <h3 id='blocked-times-list-header'>Blocked Times for Date</h3>
                            <div id='blocked-times-setter'>
                                <ul id='blocked-times-list'>
                                    {
                                        blockedTimesAndDate.map(block => {
                                            const bufferToUse = block.buffer.split(' ');
                                            const fullDate = block.date + ' ' + block.time
                                            const timeMoment = moment(fullDate, 'MMM D YYYY h:mma');
                                            const endBlock = timeMoment.clone().add(bufferToUse[0], bufferToUse[1]);
                                            const startBlock = timeMoment.clone().subtract(bufferToUse[0], bufferToUse[1]);
                                            const formattedStart = startBlock.format('h:mma')
                                            const formattedEnd = endBlock.format('h:mma')
                                            return (
                                                <li className='blocked-time-item'>
                                                    {block.date}: {formattedStart} - {formattedEnd}
                                                </li>
                                            )
                                        })
                                    }
                                </ul>
                                <CustomInputAndLabel
                                    name='date-input'
                                    className='blocked-date-label'
                                    placeholder='Aug 13 2023' 
                                    onChange={handleBlockerInputChange}
                                    label='Date'
                                    identifier='date-for-time'
                                />
                                <CustomInputAndLabel
                                    name='time-input'
                                    className='blocked-date-label'
                                    placeholder='7:30'
                                    onChange={handleBlockerInputChange}
                                    identifier='time'
                                    label='Time'
                                    changeSuffix={changeSuffix}
                                    suffix={suffix}
                                />
                                <CustomInputAndLabel
                                    name='buffer-input'
                                    className='blocked-date-label'
                                    placeholder='2 hours'
                                    onChange={handleBlockerInputChange}
                                    label={`Amount Blocked Before & After Time Block`}
                                />
                                <div id='blocked-time-buttons-wrapper'>
                                    <CustomButton 
                                        onClick={updateBlockedTime}
                                        id='confirm-dates-button'
                                        label='Add Blocked Times'
                                    />
                                    <CustomButton
                                        onClick={updateBlockedTime}
                                        id='remove-dates-button'
                                        label='Remove Blocked Times'
                                    />
                                    <p className='date-error'>
                                        {
                                            timeBlockValidity == null || timeBlockValidity == true? '' : 'Error: Invalid Date, Time, or Buffer'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div id='appointment-confirmation-setter-wrapper'>
                            <h2 id='appointment-confirmation-header'>Pending Appointments</h2>
                            <h3 id='pending-appointments-header'>New Appointments</h3>
                            <ul id='pending-appointments-list'>
                                {
                                    pendingAppointments.map((appointment, index) => {
                                        return (
                                            <li className='pending-appointment' onClick={(event) => handleAppointmentSelection(event, appointment.appointmentId)} key={index} appointmentId={appointment.appointmentId}>
                                                {appointment.name}: {appointment.appointment}
                                            </li>
                                        );
                                    })
                                }
                            </ul>
                            <CustomInputAndLabel
                                name='selected-appointment'
                                className='blocked-date-label'
                                placeholder='Select an Appointment'
                                label={`Selected Time`}
                                value={selectedAppointment}
                                identifier={'appointment'}
                            />
                            <div id='appointment-confirmation-buttons-wrapper'>
                                <CustomButton
                                    onClick={updatePendingAppointments}
                                    id='confirm-dates-button'
                                    label='Accept Appointment'
                                />
                                <CustomButton
                                    onClick={updatePendingAppointments}
                                    id='remove-dates-button'
                                    label='Reject Appointment'
                                />
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

function CustomInputAndLabel(props) {
    const { className, identifier, name, placeholder, onChange, label, changeSuffix, suffix, value} = {...props}
    return (
        <>
            <label htmlFor={name} className={className}>
                {label}
            </label>
            <div className='input-and-suffix-wrapper'>
                <input type='text' 
                       className={`date-input ${identifier}`}
                       placeholder={placeholder}
                       onChange={onChange}
                       name={name}
                       value={value}
                />
                {identifier === 'time' ? 
                    <button className='am-pm'
                            onClick={changeSuffix}
                    >
                        {suffix}
                    </button> : 
                ''}
            </div>
        </>
    );
}

function CustomButton(props) {
    const {id, onClick, label} = {...props};
    return (
        <>
            <button id={id}
                    onClick={onClick}
            >
               {label}
            </button>
        </>

    ); 
}