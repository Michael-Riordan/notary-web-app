import {Link} from "react-router-dom";

export default function CustomNav() {

    return (
        <>
            <input type='checkbox' id='menu-toggle' name='menu-toggle' />
            <label htmlFor='menu-toggle' id='menu-label'>
                <div id='menu-button-container'>
                    <div id='menu-button'>
                        
                    </div>
                </div>
            </label>
            <ul id='menu'>
                <li>
                    <Link className='dropdown-item' to='/'>Home</Link>
                </li>
                <li>
                    <a id='call-now' href={`tel:${import.meta.env.VITE_BUSINESS_PHONE_NUMBER}`}>Call Now</a>
                </li>
                <li>
                    <Link className='dropdown-item' to='/about'>About/Pricing</Link>
                </li>
                <li>
                    <Link className='dropdown-item' to='/quote'>Get a Quote</Link>
                </li>
                <li>
                    <Link className='dropdown-item' to='/appointment'>Create an Appointment</Link>
                </li>
            </ul>
        </>
    );
}