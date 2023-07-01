import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import NNAemblem from './assets/NNA-emblem.png';
import stateFlag from './assets/AZ-state-flag.png';
import CustomNav from './CustomNav';
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
import { Link } from 'react-router-dom/cjs/react-router-dom.min';

function App() {

  return (
    <>
      <Router>
      <header>
        <div className='logo'>
        <h2>Laurie A. Riordan, Certified Notary Public</h2>
        </div>
        <CustomNav />
      </header>
        <Switch>
          <Route exact path='/' component={Home} />
          <Route path='/about' component={About} />
          <Route path='/quote' component={Quote} />
        </Switch>
      <footer id='app-footer'>
        <div id='footer-info-wrapper'>
          <img id='NNA-emblem' src={NNAemblem} alt='National Notary Association'/>
          <img id='AZ-state-flag' src={stateFlag} alt='Arizona State Flag' />
          <Link to='/' id='footer-company-name'>LRmobilenotary</Link>
          <div id='footer-tabs'>
            <a id='call-now-footer' href='tel:+13473061553'>Call Now</a>
            <p>|</p>
            <Link id='footer-about-tab' to='/about'>About/Pricing</Link>
            <br/>
          </div>
          <div id='footer-tabs-2'>
            <Link id='footer-quote-tab' to='/quote'>Get a Quote</Link>
          </div>
        </div>
      </footer>
      </Router>
    </>
  );
}

export default App
