import { useState } from "react";
import {Link} from "react-router-dom";

export default function CustomNav() {
    const [isChecked, setIsChecked] = useState(true);

    const handleCheck = () => {
        isChecked? setIsChecked(false) : setIsChecked(true);
    }


    return (
        <>
            <input type='checkbox' id='menu-toggle' name='menu-toggle' checked={isChecked} onChange={handleCheck} aria-hidden='true'/>
            <label htmlFor='menu-toggle' id='menu-label' aria-haspopup='menu'>
                <div id='menu-button-container'>
                    <div id='menu-button'>
                        
                    </div>
                </div>
            </label>
            <ul id='menu' role='menu'>
                <li role='none'>
                    <Link className='dropdown-item' to='/' role='menuitem'>Home</Link>
                </li>
                <li role='none'>
                    <a id='call-now' href={`tel:${import.meta.env.VITE_BUSINESS_PHONE_NUMBER}`} role='menuitem'>Call Now</a>
                </li>
                <li role='none'>
                    <Link className='dropdown-item' to='/about' role='menuitem'>About/Pricing</Link>
                </li>
                <li role='none'>
                    <Link className='dropdown-item' to='/quote' role='menuitem'>Get a Quote</Link>
                </li>
            </ul>
        </>
    );
}