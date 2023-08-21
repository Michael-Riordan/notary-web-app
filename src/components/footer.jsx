import { Link, useLocation } from 'react-router-dom';
import NNAemblem from '../assets/NNA-emblem.png';
import stateFlag from '../assets/AZ-state-flag.png';

export default function Footer() {
    const location = useLocation();

    const footerClassName = location.pathname === '/'? 'home' 
    : location.pathname === '/about'? 'about' 
    : location.pathname === '/quote'? 'quote' 
    : location.pathname === '/appointment'? 'appointment'
    : location.pathname === '/admin'? 'admin' 
    : '';

    return (
        <>
            <footer className={`app-footer ${footerClassName}`}>
                <div id='footer-info-wrapper'>
                <img id='NNA-emblem' src={NNAemblem} alt='National Notary Association'/>
                <div id='footer-tabs-wrapper'>
                    <Link to='/' className={`footer-content footer-company-name ${footerClassName}`}>LR-MobileNotary</Link>
                    <div className='footer-tabs'>
                        <a className={`footer-content ${footerClassName}`} href={`tel:${import.meta.env.VITE_BUSINESS_PHONE_NUMBER}`}>Call Now</a>
                        <span> | </span>
                        <Link className={`footer-content ${footerClassName}`} to='/about'>About/Pricing</Link>
                    </div>
                    <div className='footer-tabs'>
                        <Link className={`footer-content ${footerClassName}`} to='/quote'>Get a Quote</Link>
                        <span> | </span>
                        <Link className={`footer-content ${footerClassName}`} to='/admin'>Admin</Link>
                    </div>
                </div>
                <img id='AZ-state-flag' src={stateFlag} alt='Arizona State Flag' />
                </div>
            </footer>
        </>
    );
}