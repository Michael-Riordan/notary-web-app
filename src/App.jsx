import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import NNAemblem from './assets/NNA-emblem.png';
import stateFlag from './assets/AZ-state-flag.png';
import CustomNav from './components/CustomNav';
import Home from './components/homePage';
import About from './components/about';
import Quote from './components/quote';
import './css/homepage.css'
import './css/header.css'
import './css/customNav.css'
import './css/footer.css'
import './css/about.css'
import './css/quote.css'
import './css/placesAutocomplete.css'
import './css/appointment.css'
import './css/calendar-custom.css'
import './css/adminAndHours.css'
import './css/adminBlockedDates.css'
import './css/adminBlockedTimes.css'
import './css/adminAppointmentConfirmation.css'
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import Appointment from './components/appointment';
import Admin from './components/admin';

function App() {
  
  return (
    <>
      <Router>
      <header>
        <div className='logo'>
        <Link to='/' id='header-webname'>LR-MobileNotary</Link>
        </div>
        <div id='menu-wrapper'>
          <CustomNav />
        </div>
      </header>
        <Switch>
          <Route exact path='/' component={Home} />
          <Route path='/about' component={About} />
          <Route path='/quote' component={Quote} />
          <Route path='/appointment' component={Appointment} />
          <Route path='/admin' component={Admin} />
        </Switch>
      <footer id='app-footer'>
        <div id='footer-info-wrapper'>
          <img id='NNA-emblem' src={NNAemblem} alt='National Notary Association'/>
          <div id='footer-tabs-wrapper'>
            <Link to='/' id='footer-company-name'>LR-MobileNotary</Link>
            <div className='footer-tabs'>
              <a id='call-now-footer' href={`tel:${import.meta.env.VITE_BUSINESS_PHONE_NUMBER}`}>Call Now</a>
              <span> | </span>
              <Link id='footer-about-tab' to='/about'>About/Pricing</Link>
            </div>
            <div className='footer-tabs'>
              <Link id='footer-quote-tab' to='/quote'>Get a Quote</Link>
              <span> | </span>
              <Link id='footer-admin-tab' to='/admin'>Admin</Link>
            </div>
          </div>
          <img id='AZ-state-flag' src={stateFlag} alt='Arizona State Flag' />
        </div>
      </footer>
      </Router>
    </>
  );
}

export default App
