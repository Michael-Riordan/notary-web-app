import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import Calendar from 'react-calendar';
import moment from 'moment';
import 'react-calendar/dist/Calendar.css'
import '../css/calendar-custom.css'

export default function Appointment() {
    const [clickedDate, setClickedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [chosenWeekendDay, setChosenWeekendDay] = useState(null)
    const [chosenWeekday, setChosenWeekday] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [appointmentId, setAppointmentId] = useState(null);

    const history = useHistory();

    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu','Fri']
    const daysAndTimes = {
        weekday: weekdays.map(weekday => ({
            weekday: weekday,
            times: ['6:00pm', '6:30pm', '7:00pm', '7:30pm', '8:00pm',  '8:30pm', '9:00pm'],
        })),
        'Sat': ['7:00am', '7:30am', '8:00am', '8:30am', '9:00am', 
                '9:30am', '10:00am', '10:30am', '11:00am', '11:30am', 
                '12:00pm', '12:30pm', '1:00pm', '1:30pm','2:00pm', 
                '2:30pm', '3:00pm', '3:30pm', '4:00pm'],
        'Sun': ['9:00am', '9:30am', '10:00am', '10:30am', '11:00am', 
                '11:30am', '12:00pm', '12:30pm', '1:00pm', '1:30pm',
                '2:00pm', '2:30pm', '3:00pm', '3:30pm', '4:00pm']
    }

    const calculateMaxDate = () => {
        const date = (new Date());
        const numberDay = date.getDate();
        const month = (date.getMonth());
        const year = (date.getFullYear());
        if (month === 11) {
            return new Date(year + 1, 0, 1);
        } else {
            return new Date(year, month + 1, numberDay);
        }
        /*return (new Date(0, (month + 1), date.getDay()), date.getFullYear());*/
    }


    const handleClick = (value) => {
        const date = value.toString();
        const trimmedDate = date.split(" ").slice(0, 4);
        const dayOfWeek = date.split(" ")[0];
        const numberDate = date.split(" ")[2]
        let suffix;
        numberDate[numberDate.length - 1] === '1' && numberDate !== '11'? suffix = 'st' : 
        numberDate[numberDate.length - 1] === '2' && numberDate !== '12'? suffix = 'nd' : 
        numberDate[numberDate.length - 1] === '3' && numberDate !== '13'? suffix = 'rd' :
        suffix = 'th';
        trimmedDate[2] = numberDate + suffix;
        
        if (dayOfWeek === 'Sat' || dayOfWeek === 'Sun') {
            setChosenWeekendDay(dayOfWeek);
        } else {
            const weekday = daysAndTimes.weekday.filter(day => {
                if (day.weekday === dayOfWeek) {
                    return day.weekday;
                }
            });
            setChosenWeekday(weekday);
        }
        setClickedDate(trimmedDate.join(" "));
    }
    // Adding appointment time immediately upon click to block appointment before prompt.
    const handleInputClick = (event) => {
        if (selectedTime == null) {
            setSelectedTime(event.target.value);
            axios.post(`http://${import.meta.env.VITE_IP_ADDRESS}/addAppointment`, {
                appointmentTime: event.target.value,
                appointmentDate: clickedDate, 
            });
        }
    }

    const handleApptConfirmation = () => {
        const appointmentData = {appointmentTime: selectedTime,
                                 appointmentDate: clickedDate,
                                 appointmentId: appointmentId};
        const queryParams = new URLSearchParams(appointmentData).toString();
        history.push(`/quote?${queryParams}`);
    }

    const handleApptRejection = () => {
        let chosenAppointmentId;
        appointments.forEach(appointment => {
            if (appointment.appointmentTime === selectedTime && clickedDate === appointment.appointmentDate) {
                chosenAppointmentId = appointment.appointmentid;
            }
        });
        axios.delete(`http://${import.meta.env.VITE_IP_ADDRESS}/deleteAppointment/${chosenAppointmentId}`)
        setSelectedTime(null)
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
            if (time === appointment.appointmentTime && clickedDate === appointment.appointmentDate && chosenWeekday == null) {
                disabled = true;
            } else if (appointment.appointmentDate === clickedDate && chosenWeekday == null) {
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
        const blockedTimes = [];
        const now = new Date();
        const todayFormatted = moment(now).format('ddd MMM D YYYY');
        const todayObject = moment(now, 'ddd MMM D YYYY h:mma');
        const todayBuffer = todayObject.clone().add(1.5, 'hours')
        const day = moment(date).format('ddd MMM D YYYY');
        if (todayFormatted === day) {
            const weekday = day.split(' ')[0];
            daysAndTimes[weekday].forEach(time => {
                const dayAndTime = day + ' ' + time;
                const dayAndTimeObj = moment(dayAndTime, 'ddd MMM D YYYY h:mma');
                if (dayAndTimeObj <= todayBuffer) {
                    blockedTimes.push(dayAndTimeObj._i);
                    if (blockedTimes.length >= daysAndTimes[weekday].length) {
                        disabled = true;
                    }
                }
            });
        }

        appointments.forEach(appointment => {
            const day = appointment.appointmentDate.split(' ')[0]
            const dateNoSuffix = appointment.appointmentDate.replace(/th|st|rd|nd/, '');
            if (weekdays.includes(day)) {
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
                    while (startTime <= blockEnd) {
                        if (daysAndTimes[day].includes(startTime.format('ddd MMM D YYYY h:mma').split(' ')[4])) {
                            if (!blockedTimes.includes(dateNoSuffix + ' ' + startTime.format('ddd MMM DD YYYY h:mma').split(' ')[4])) {
                                blockedTimes.push(startTime.format('ddd MMM DD YYYY h:mma'))
                            };
                        }
                        startTime.add(30, 'minutes');
                    }
                    if (blockedTimes.length >= daysAndTimes[day].length) {
                        disabled = true;
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
            console.log('rendered');
        }
    }, [clickedDate]);

    useEffect(() => {
        axios.get(`http://${import.meta.env.VITE_IP_ADDRESS}/appointments`)
            .then((response) => response.data)
            .then(response => {
                setAppointments(response);
                if (response.length !== 0) {
                    console.log('setting appointmentid');
                    setAppointmentId(response[response.length - 1].appointmentid)
                }});
    }, [selectedTime])

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
                     chosenWeekendDay !== null ? 
                     daysAndTimes[chosenWeekendDay].map((time, index) => {
                            return (
                                <>
                                    <li key={index} 
                                        className='appointment-time'
                                        style={checkDisabled(time)? {display: 'none'} : {display: 'inherit'}}>
                                        <label htmlFor='time-input' className='time-label'>
                                            {time}
                                            <input type='checkbox' 
                                                   onChange={handleInputClick} 
                                                   value={time} 
                                                   disabled={checkDisabled(time)}
                                                   className='time-input'
                                            />
                                        </label>
                                    </li>
                                </>
                            );
                        }) :
                     chosenWeekday[0].times.map((time, index) => {
                            return (
                                <>
                                    <li key={index} className='appointment-time'>
                                        <label htmlFor='time-input' className='time-label'>
                                            {time}
                                            <input type='checkbox' onClick={handleInputClick} value={time} disabled={checkDisabled(time)} className='time-input'/>
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