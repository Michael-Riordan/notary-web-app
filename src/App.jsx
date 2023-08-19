import {BrowserRouter as Router, Route, Switch, Link} from 'react-router-dom';
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
import './css/adminAcceptedAppointments.css'
import Appointment from './components/appointment';
import Admin from './components/admin';
import Footer from './components/footer';

function App() {
  
  return (
    <>
      <Router>
        <header>
          <nav id='nav-list'>
            <Link to='/quote' className='route-link'>Get a Quote</Link>
            <Link to='/about' className='route-link'>About</Link>
            <Link to='/' id='header-webname'>LR-MobileNotary</Link>
            <a href='mailto:lrmobilenotaryaz@gmail.com' className='route-link'>Email Us</a>
            <a href='tel:+13473061553' className='route-link'>Call Us</a>
          </nav>
        </header>
        <Switch>
          <Route exact path='/' component={Home} />
          <Route path='/about' component={About} />
          <Route path='/quote' component={Quote} />
          <Route path='/appointment' component={Appointment} />
          <Route path='/admin' component={Admin} />
        </Switch>
        <Footer />
      </Router>
    </>
  );
}

export default App
