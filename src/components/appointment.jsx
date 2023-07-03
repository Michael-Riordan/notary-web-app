import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'
import '../css/calendar-custom.css'

export default function Appointment() {
    const [clickedDay, setClickedDay] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);

    const times = [
        {time: '5:30pm'},
        {time: '6:30pm'},
        {time: '7:30pm'}
    ]


    const handleClick = (value) => {
        const date = value.toString();
        const trimmedDate = date.split(" ").slice(0, 4).join(" ");
        setClickedDay(trimmedDate)
    }

    const handleInputClick = (event) => {
        console.log(event.target)
    }

    return (
        <section id='calendar-body'>
            <h1 id='appointment-header'>Select an Appointment</h1>
            {clickedDay == null? <div id='calendar-wrapper'>
                <Calendar id='calendar'
                          minDate={new Date()}
                          onClickDay={handleClick}/>
            </div> :
            <div id='appointment-selector'>
                <h2>{clickedDay.toString()}</h2>
                <ul id='appointment-time-list'>
                    {
                        times.map((time, index) => {
                            return (
                                <>
                                    <li key={index} className='appointment-time'>
                                        <label htmlFor='time-input'>
                                            {time.time}
                                            <input type='checkbox' onClick={handleInputClick}/>
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