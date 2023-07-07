import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'
import '../css/calendar-custom.css'

export default function Appointment() {
    const [clickedDate, setClickedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [chosenWeekendDay, setChosenWeekendDay] = useState(null)
    const [chosenWeekday, setChosenWeekday] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [appointmentId, setAppointmentId] = useState(null);
    const [matchedDates, setMatchedDates] = useState([]);

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
        const trimmedDate = date.split(" ").slice(0, 4).join(" ");
        const dayOfWeek = trimmedDate.split(" ")[0];
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
        setClickedDate(trimmedDate)
    }
    // Adding appointment time immediately upon click to block appointment before prompt.
    const handleInputClick = (event) => {
        if (selectedTime == null) {
            setSelectedTime(event.target.value);
            axios.post(`http://${import.meta.env.VITE_IP_ADDRESS}/addAppointment`, {
                appointmentTime: event.target.value,
                appointmentDate: clickedDate, 
            });
            console.log('appointment added');
        }
    }

    const handleApptConfirmation = () => {
        const appointmentData = {appointmentTime: selectedTime,
                                 appointmentDate: clickedDate,
                                 appointmentId: appointmentId};
        console.log(appointmentData.appointmentId);
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
    //really really really really really poorly written code need to re-do
    const checkDisabled = (time) => {
        let disabled = false;
    // weekend needs blocked times 2hr:30min after scheduled appointment.
        appointments.forEach(appointment => {
            if (time === appointment.appointmentTime && clickedDate === appointment.appointmentDate && chosenWeekday == null) {
                disabled = true;
            } else if (appointment.appointmentDate === clickedDate && chosenWeekday == null) {
                console.log(clickedDate);
                if (clickedDate === appointment.appointmentDate && chosenWeekday == null) {
                    return;
                }
            }
        })
    }

    const checkAppointmentsForDay = (date) => {
        let disabled = false;
        appointments.forEach(appointment => {
            const day = appointment.appointmentDate.split(' ')[0]
            if (weekdays.includes(day)) {
                if (appointment.appointmentDate === date.toDateString()) {
                    disabled = true;
                    return;
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
            <h1 id='appointment-header'>Schedule an Appointment</h1>
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
             <div id='appointment confirmation'>
                <h2>Chosen Appointment: {clickedDate} @ {selectedTime}</h2>
                <button onClick={handleApptConfirmation}>Confirm</button>
                <button onClick={handleApptRejection}>Cancel</button>
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
                <h2>{clickedDate.toString()}</h2>
                <ul id='appointment-time-list'>
                    {                    
                     chosenWeekendDay !== null ? 
                     daysAndTimes[chosenWeekendDay].map((time, index) => {
                            return (
                                <>
                                    <li key={index} className='appointment-time'>
                                        <label htmlFor='time-input'>
                                            {time}
                                            <input type='checkbox' onClick={handleInputClick} value={time} disabled={checkDisabled(time)}/>
                                        </label>
                                    </li>
                                </>
                            );
                        }) :
                     chosenWeekday[0].times.map((time, index) => {
                            return (
                                <>
                                    <li key={index} className='appointment-time'>
                                        <label htmlFor='time-input'>
                                            {time}
                                            <input type='checkbox' onClick={handleInputClick} value={time} disabled={checkDisabled(time)}/>
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