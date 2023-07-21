import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import Calendar from 'react-calendar';
import moment from 'moment';
import 'react-calendar/dist/Calendar.css'
import '../css/calendar-custom.css'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu','Fri'];

export default function Appointment() {
    const [clickedDate, setClickedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [appointmentId, setAppointmentId] = useState(null);
    const [daysAndHours, setDaysAndHours] = useState([]);
    const [days, setDays] = useState([]);
    const [hoursForCurrentDay, setHoursForCurrentDay] = useState([]);
    const [blockedDates, setBlockedDates] = useState(null);

    const history = useHistory();

    const calculateMaxDate = () => {
        //any tile date past the max date will be disabled; 
        const date = (new Date());
        const numberDay = date.getDate();
        const month = (date.getMonth());
        const year = (date.getFullYear());
        if (month === 11) {
            return new Date(year + 1, 0, 1);
        } else {
            return new Date(year, month + 1, numberDay);
        }
    }


    const handleClick = (value) => {
        const date = value.toString();
        const trimmedDate = date.split(" ").slice(0, 4);
        const numberDate = date.split(" ")[2]
        let suffix;
        numberDate[numberDate.length - 1] === '1' && numberDate !== '11'? suffix = 'st' : 
        numberDate[numberDate.length - 1] === '2' && numberDate !== '12'? suffix = 'nd' : 
        numberDate[numberDate.length - 1] === '3' && numberDate !== '13'? suffix = 'rd' :
        suffix = 'th';
        trimmedDate[2] = numberDate + suffix;
        setClickedDate(trimmedDate.join(" "));
    }

    const handleInputClick = (event) => {
        if (selectedTime == null) {
            setSelectedTime(event.target.value);
        }
    }

    const handleApptConfirmation = () => {
        const appointmentData = {appointmentTime: selectedTime,
                                 appointmentDate: clickedDate,
                                 appointmentId: appointmentId};
        const queryParams = new URLSearchParams(appointmentData).toString();
        axios.post(`http://${import.meta.env.VITE_IP_ADDRESS}/addAppointment`, {
            appointmentTime: selectedTime,
            appointmentDate: clickedDate, 
        });
        //pushing appointment data to quote page to be displayed.
        history.push(`/quote?${queryParams}`);
    }

    const handleApptRejection = () => {
        setSelectedTime(null);
        setClickedDate(null);
    }

    // weekend needs blocked times 2hr:30min before and after scheduled appointment.
    const checkDisabled = (time) => {
        let disabled = false;

        const now = new Date();
        const dateNoSuffix = clickedDate.replace((/th|st|nd|rd/), '');
        const openDate = new Date(dateNoSuffix);
        const dateAndTime = dateNoSuffix + ' ' + time;
        const todayFormatted = moment(now).format('ddd MMM D YYYY h:mma');
        const todayNoTime = todayFormatted.split(' ').slice(0, 4).join(' ');
        const openDateFormatted = moment(openDate).format('ddd MMM D YYYY');
        const todayObject = moment(now, 'ddd MMM D YYYY h:mma');
        const openDateAndTimeObject = moment(dateAndTime, 'ddd MMM D YYYY h:mma')
        const todayBuffer = todayObject.clone().add(1.5, 'hours')
        //handling same day appointments using above variables -- buffer = 1.5 hours
        if (todayNoTime === openDateFormatted) {
            if (openDateAndTimeObject <= todayBuffer) {
                disabled = true;
            };
        }
        
        appointments.forEach(appointment => {
            if (time === appointment.appointmentTime && clickedDate === appointment.appointmentDate) {
                disabled = true;
            } else if (appointment.appointmentDate === clickedDate) {
                const dateAndTime = appointment.appointmentDate + ' ' + appointment.appointmentTime;
                const formattedDate = moment(dateAndTime, 'ddd MMM Do YYYY h:mma');
                const blockStart = formattedDate.clone().subtract(2.5, 'hours');
                const blockEnd = formattedDate.clone().add(2.5, 'hours');
                const blockedTimes = [];
                let startTime = blockStart.clone();
                
                while (startTime <= blockEnd) {
                    blockedTimes.push(startTime.format('ddd MMM D YYYY h:mma'));
                    startTime.add(30, 'minutes');
                }
                if (blockedTimes.includes(appointment.appointmentDate.replace(/0?(\d+)(?:st|nd|rd|th)?/g, '$1') + ' ' + time)) {
                    disabled = true;
                }
            }
        });
        return disabled;
    }
    
    const checkAppointmentsForDay = (date) => {
        let disabled = false;

        //checking if date is in blockedDates - disabling calendar tile if so.
        const dayToCheck = date.toString().split(' ').slice(0, 4).join(' ');
        if (blockedDates != null) {
            blockedDates[0].Blocked.forEach(span => {
                const startDateEndDate = span.split('-');
                if (startDateEndDate.length === 1) {
                    const weekdayAndDay = moment(span.toString(), 'MMM D YYYY');
                    const formattedWeekdayAndDay = weekdayAndDay._d.toString().split(' ').slice(0, 4).join(' ');
                    if (dayToCheck === formattedWeekdayAndDay) {
                        disabled = true;
                    }
                } else {
                    const startDateMoment = moment(startDateEndDate[0], 'MMM D YYYY');
                    const endDateMoment = moment(startDateEndDate[1], 'MMM D YYYY');
                    const startDateClone = startDateMoment.clone();
                    while (startDateClone <= endDateMoment) {
                        const blockedDay = startDateClone._d.toString().split(' ').slice(0, 4).join(' ');
                        if (dayToCheck === blockedDay) {
                            disabled = true;
                        }
                        startDateClone.add(1, 'day');
                    };
                };
            });
        };

        const blockedTimes = [];
        const now = new Date();
        const todayFormatted = moment(now).format('ddd MMM D YYYY');
        const todayObject = moment(now, 'ddd MMM D YYYY h:mma');
        const todayBuffer = todayObject.clone().add(1.5, 'hours')
        const day = moment(date).format('ddd MMM D YYYY');
        //checking if all possible appointment times are past for day tile
        if (todayFormatted === day) {
            const weekday = day.split(' ')[0];
            for (let i=0; i<7; i++) {
                if (daysAndHours.length > 0) {
                    if (Object.keys(daysAndHours[i])[0] === weekday) {
                        daysAndHours[i][weekday].forEach(time => {
                            const dayAndTime = day + ' ' + time;
                            const dayAndTimeObj = moment(dayAndTime, 'ddd MMM D YYYY h:mma');
                            if (dayAndTimeObj <= todayBuffer) {
                                if (!blockedTimes.includes(dayAndTimeObj._i)) {
                                    blockedTimes.push(dayAndTimeObj._i);
                                    if (blockedTimes.length >= daysAndHours[i][weekday].length) {
                                        disabled = true;
                                    }
                                }
                            }
                        })
                    }
                }
            }
        }

        //checking if all appointment times are blocked off for day tile
        appointments.forEach(appointment => {
            const day = appointment.appointmentDate.split(' ')[0]
            const dateNoSuffix = appointment.appointmentDate.replace(/th|st|rd|nd/, '');
            if (WEEKDAYS.includes(day)) {
                if (dateNoSuffix === date.toDateString()) {
                    disabled = true;
                }
            } else {
                if (dateNoSuffix === date.toDateString() && appointment.appointmentTime !== '') {
                    const dateAndTime = appointment.appointmentDate + ' ' + appointment.appointmentTime;
                    const formattedDate = moment(dateAndTime, 'ddd MMM DD YYYY h:mma');
                    const blockStart = formattedDate.clone().subtract(2.5, 'hours');
                    const blockEnd = formattedDate.clone().add(2.5, 'hours');
                    let startTime = blockStart.clone();
                    let hoursForDay;
                    for (let i=0; i<7; i++) {
                        if (daysAndHours.length > 0) {
                            if (Object.keys(daysAndHours[i])[0] === day) {
                                hoursForDay = daysAndHours[i][day]
                            }
                        }
                    }
                    while (startTime <= blockEnd) {
                        if (hoursForDay != null) {
                            if (hoursForDay.includes(startTime.format('ddd MMM D YYYY h:mma').split(' ')[4])) {
                                if (!blockedTimes.includes(dateNoSuffix + ' ' + startTime.format('ddd MMM DD YYYY h:mma').split(' ')[4])) {
                                    blockedTimes.push(startTime.format('ddd MMM DD YYYY h:mma'))
                                };
                            }
                            if (blockedTimes.length >= hoursForDay.length) {
                                disabled = true;
                            }
                        }
                        startTime.add(30, 'minutes');
                    }
                }
            }
        })
        return disabled;
    }

    useEffect(() => {
        if (clickedDate == null) {
            const monthButton = document.querySelector('.react-calendar__navigation__label');
            monthButton.disabled = true;
        }
    }, [clickedDate]);

    useEffect(() => {
        const getAppointments = async () => {
            await axios.get(`http://${import.meta.env.VITE_IP_ADDRESS}/appointments`)
                .then((response) => response.data)
                .then(response => {
                    setAppointments(response);
                    if (response.length !== 0) {
                        console.log('setting appointmentid');
                        setAppointmentId(response[response.length - 1].appointmentid)
                    }});
        }
        getAppointments();
    }, [selectedTime])

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
        if (clickedDate != null) {
            const correctDay = daysAndHours.filter((day, index) => {
                return daysAndHours[index].hasOwnProperty(clickedDate.split(' ')[0]);
            });
        
            const dayAndHours = [...correctDay]
            const day = clickedDate.split(' ')[0]
            setHoursForCurrentDay(dayAndHours[0][day]);
        }

    }, [clickedDate]);

    useEffect(() => {
        const fetchBlockedDates = async () => {
            const results = await fetch(`http://${import.meta.env.VITE_IP_ADDRESS}/api/blocked-dates`);
            const blockedDates = await results.json();
            setBlockedDates(blockedDates);
        }
        fetchBlockedDates();
    }, []);

    return (
        <section id='calendar-body'>
            <h1 id='appointment-header'>Select an Appointment Date/Time</h1>
                <div id='hours'>
                    <div id='weekdays'>
                        <h2 className='days'>Mon-Fri</h2>
                        <p className='time'>6:00pm - 9:00pm</p>
                        <h2 className='days'>Sat</h2>
                        <p className='time'>7:00am - 4:00pm</p>
                        <h2 className='days'>Sun</h2>
                        <p className='time'>9:00am - 4:00pm</p>
                    </div>
                </div>
            {selectedTime != null?
             <div id='appointment-confirmation'>
                <h2 id='selected-time'>Chosen Appointment: <br/> {clickedDate} @ {selectedTime}</h2>
                <div id='confirmation-button-wrapper'>
                  <button id='confirm-button' onClick={handleApptConfirmation}>Confirm</button>
                  <button id='cancel-button' onClick={handleApptRejection}>Cancel</button>
                </div>
             </div> :
              clickedDate == null? <div id='calendar-wrapper'>
                <Calendar id='calendar'
                          minDate={new Date()}
                          maxDate={calculateMaxDate()}
                          onClickDay={handleClick}
                          tileDisabled={({activeStartDate, date, view }) => checkAppointmentsForDay(date)}

                />
            </div> :
            <div id='appointment-selector'>
                <h2 className='appointment-selector-header'>{clickedDate.toString()}</h2>
                <h3 className='appointment-selector-header'>Available Appointments: </h3>
                <ul id='appointment-time-list'>
                    {                    
                     hoursForCurrentDay.map((time, index) => {
                            return (
                                <>
                                    <li key={index} 
                                        className='appointment-time'
                                        style={checkDisabled(time)? {display: 'none'} : {display: 'inherit'}}>
                                        <label htmlFor='time-input' 
                                               className='time-label'
                                               >
                                            {time}
                                            <input type='checkbox' 
                                                   onClick={handleInputClick} 
                                                   value={time} 
                                                   disabled={checkDisabled(time)}
                                                   className={'time-input'}
                                            />
                                        </label>
                                    </li>
                                </>
                            );
                        })
                    }
                </ul>
            </div>}
        </section>
    );
}