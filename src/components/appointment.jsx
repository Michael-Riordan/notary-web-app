import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'
import '../css/calendar-custom.css'

export default function Appointment() {
    const [clickedDate, setClickedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [chosenWeekendDay, setChosenWeekendDay] = useState(null)
    const [chosenWeekday, setChosenWeekday] = useState(null);

    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu','Fri']
    const daysAndTimes = {
        weekday: weekdays.map(weekday => ({
            weekday: weekday,
            times: ['6:00pm', '6:30pm', '7:00pm', '7:30pm', '8:00pm',  '8:30pm', '9:00pm'],
        })),
        'Sat': ['7:00am', '7:30am', '8:00am', '8:30am', '9:00am', '9:30am', '10:00am', '10:30am', '11:00am'],
        'Sun': ['9:00am', '9:30am', '10:00am', '10:30am', '11:00am']
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

    const handleInputClick = (event) => {
        selectedTime == null ? setSelectedTime(event.target.value) : setSelectedTime(null);
    }

    useEffect(() => {
        if (clickedDate == null) {
            const monthButton = document.querySelector('.react-calendar__navigation__label');
            monthButton.disabled = true;
            console.log('rendered');
        }
    }, [clickedDate])

    return (
        <section id='calendar-body'>
            <h1 id='appointment-header'>Select an Appointment</h1>
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
            {clickedDate == null? <div id='calendar-wrapper'>
                <Calendar id='calendar'
                          minDate={new Date()}
                          maxDate={calculateMaxDate()}
                          onClickDay={handleClick}
                />
            </div> :
            <div id='appointment-selector'>
                <h2>{clickedDate.toString()}</h2>
                <ul id='appointment-time-list'>
                    {chosenWeekendDay !== null ? 
                     daysAndTimes[chosenWeekendDay].map((time, index) => {
                            return (
                                <>
                                    <li key={index} className='appointment-time'>
                                        <label htmlFor='time-input'>
                                            {time}
                                            <input type='checkbox' onClick={handleInputClick} value={time} disabled={selectedTime !== null && selectedTime !== time}/>
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
                                            <input type='checkbox' onClick={handleInputClick} value={time} disabled={selectedTime !== null && selectedTime !== time}/>
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