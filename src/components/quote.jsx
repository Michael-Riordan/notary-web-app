import { useEffect, useState } from "react";
import { useHistory, useLocation } from 'react-router-dom';
import axios from "axios";
import googleLogo from '/src/assets/google_on_white_hdpi.png'
import emailjs from '@emailjs/browser'
import PlacesAutocomplete from "./PlacesAutocomplete";

export default function Quote() {
    const [isClicked, setIsClicked] = useState(false);
    const [appointmentSelectorOpen, setAppointmentSelectorOpen] = useState(false);
    const [appointmentRequested, setAppointmentRequested] = useState(null);
    const [selectedServices, setSelectedServices] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [numOfNotarizations, setNumOfNotarizations] = useState(0);
    const [notarizationPrice, setNotarizationPrice] = useState(0);
    const [addressInput, setAddressInput] = useState('');
    const [place_id, setPlaceId] = useState('');
    const [costOfGas, setCostOfGas] = useState(0);
    const [nameInput, setNameInput] = useState('');
    const [emailInput, setEmailInput] = useState('');
    const isDisabled = nameInput === '' || emailInput === '' || addressInput === '' || selectedServices.length === 0;
    const [emailSent, setEmailSent] = useState(null);
    const [emailValid, setEmailValid] = useState(false);
    const [numberInput, setNumberInput] = useState('');
    const [appointment, setAppointment] = useState('');
    const [appointmentId, setAppointmentId] = useState(null);
    const [emailContent, setEmailContent] = useState(`Hello LRmobilenotary, \n    My name is ${nameInput} and I'm inquiring about your notary services. Here is my info: \n \n
My Preferred Signing Location: ${addressInput} \n
Cost of Gas to Signing Location ($${.62} round trip): ${costOfGas} \n
My Free Estimate: ${totalPrice + notarizationPrice + (Number(costOfGas))}`);

    
    const history = useHistory();
    const location = useLocation();

    const services = [
        {id: 0, name: 'Acknowledgement', price: 10},
        {id: 1, name: 'Jurat', price: 10},
        {id: 2, name: 'Loan Package', price: 125},
        {id: 3, name: 'Notarization', price: '', notarizations: numOfNotarizations},
    ];

    /*created servicesContd to conditionally load in this service as a list item*/
    const servicesContd = [
        {id: 4, name: 'Second Loan Package', price: 50}
    ];

    
    const handleClick = () => {
        setIsClicked(!isClicked);
    }

    const handleAppointmentClick = () => {
        setAppointmentSelectorOpen(!appointmentSelectorOpen);
    }

    const changeAppointmentRequest = (event) => {
        if (appointmentRequested == null) {
            setAppointmentRequested(event.target.value);
            if (event.target.value === 'yes' && appointment === '') {
                sessionStorage.setItem('addressData', JSON.stringify(addressInput));
                sessionStorage.setItem('totalPrice', JSON.stringify(totalPrice));
                sessionStorage.setItem('servicesData', JSON.stringify(selectedServices));
                sessionStorage.setItem('notarizationPrice', JSON.stringify(notarizationPrice));
                sessionStorage.setItem('numOfNotarizations', JSON.stringify(numOfNotarizations));
                sessionStorage.setItem('costOfGasData', JSON.stringify(costOfGas));
                sessionStorage.setItem('nameData', JSON.stringify(nameInput));
                sessionStorage.setItem('emailData', JSON.stringify(emailInput));
                sessionStorage.setItem('emailValidationData', JSON.stringify(emailValid));
                sessionStorage.setItem('phoneData', JSON.stringify(numberInput));
                history.push('./appointment')
            } else {
                sessionStorage.setItem('addressData', JSON.stringify(addressInput));
                sessionStorage.setItem('totalPrice', JSON.stringify(totalPrice));
                sessionStorage.setItem('servicesData', JSON.stringify(selectedServices));
                sessionStorage.setItem('notarizationPrice', JSON.stringify(notarizationPrice));
                sessionStorage.setItem('numOfNotarizations', JSON.stringify(numOfNotarizations));
                sessionStorage.setItem('costOfGasData', JSON.stringify(costOfGas));
                sessionStorage.setItem('nameData', JSON.stringify(nameInput));
                sessionStorage.setItem('emailData', JSON.stringify(emailInput));
                sessionStorage.setItem('emailValidationData', JSON.stringify(emailValid));
                sessionStorage.setItem('phoneData', JSON.stringify(numberInput));
                axios.delete(`http://${import.meta.env.VITE_IP_ADDRESS}/deleteAppointment/${appointmentId}`)
                history.push('./appointment')
            }
        } else {
            setAppointmentRequested(null);
        }
    }

    const handleCheckboxChange = (serviceId, servicePrice) => {
        setSelectedServices((prevSelectedServices) => {
            const isSelected = prevSelectedServices.includes(serviceId);
            
            if (serviceId === 3 && isSelected) {
                setNumOfNotarizations(0);
                setNotarizationPrice(0);
                return prevSelectedServices.filter((id) => id !== serviceId);
            } else if (serviceId === 3 && !isSelected) {
                return [...prevSelectedServices, serviceId]
            } else if (serviceId === 2 && isSelected) {
                if (prevSelectedServices.includes(4)) {
                    setTotalPrice(totalPrice - 175);
                    return prevSelectedServices.filter((id) => id !== 2 && id !== 4)
                } else {
                    setTotalPrice(totalPrice - 125);
                    return prevSelectedServices.filter((id) => id !== 2)
                }
            } else if (isSelected) {
                setTotalPrice(totalPrice - servicePrice);
                return prevSelectedServices.filter((id) => id !== serviceId);
            } else {
                setTotalPrice(totalPrice + servicePrice);
                return [...prevSelectedServices, serviceId];
            }
        });
    };

    const handleInputNumberChange = (numberOfNotarizations) => {
        setNumOfNotarizations(numberOfNotarizations);
        const price = (numberOfNotarizations * 10);
        setNotarizationPrice(price);
    };

    // Handles Data passed up DOM tree from PlacesAutocomplete Child Component
    const handleAddressData = (address) => {
        setPlaceId(address.place_id);
        setAddressInput(address.description);
    }

    const handleInputChange = (event) => {
        if (event.target.className === 'input name') {
            setNameInput(event.target.value);
        } else if (event.target.className === 'input email') {
            setEmailInput(event.target.value);
            event.target.validity.valid? setEmailValid(true) : setEmailValid(false);
        } else if (event.target.className === 'textarea email-content') {
            setEmailContent(event.target.value);
        } else if (event.target.className === 'input address') {
            setAddressInput(event.target.value);
        } else if (event.target.className) {
            console.log(typeof event.target.value);
            setNumberInput(event.target.value);
        }
    };

    const sendEmail = (event) => {
        event.preventDefault();

        const templateParams = {
            from_name: nameInput,
            message: emailContent,
            to_name: 'Laurie',
            reply_to: emailInput,
        }

        emailjs.send(import.meta.env.VITE_EMAIL_JS_SERVICE_ID, import.meta.env.VITE_EMAIL_JS_TEMPLATE_ID, templateParams, import.meta.env.VITE_EMAIL_JS_PUBLIC_KEY)
            .then((result) => {
                console.log(result.text);
                setEmailSent(true);
            }, (error) => {
                console.log(error.text);
                setEmailSent(false);
            });

        fetch(`http://${import.meta.env.VITE_IP_ADDRESS}/updatePendingAppointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({name: nameInput, appointment: appointment, appointmentId: appointmentId}),
        })
          .then(res => 
            res.json())
          .then(data => {
            console.log(data);
          })
          .catch(error => {
            console.error(error);
          })

    };

    useEffect(() => {
        const fetchDistance = async () => {
            if (place_id != '') {
                const response = await fetch(`http://${import.meta.env.VITE_IP_ADDRESS}/api/distance?query=${encodeURIComponent(place_id)}`);
                const responseData = await response.json();
                if (responseData.error == undefined) {
                    const routeDistance = responseData.routes[0].legs[0].distance.text;
                    if (routeDistance.includes('ft')) {
                        setCostOfGas(0);
                    } else {
                        const miles = parseFloat(routeDistance.replace(',', ''));
                        setCostOfGas(Number(miles * (.62 * 2)).toFixed(2));
                    }
                }
            }
        }
        fetchDistance();
    }, [place_id]);

    useEffect(() => {
        !emailValid? setEmailContent('Please Enter a Valid Email Address.') :
        setEmailContent(`Hello LRmobilenotary, \n    My name is ${nameInput} and I'm inquiring about your notary services. \n 
Here is my info: \n
My Preferred Signing Location: ${addressInput} \n
Cost of Gas to Signing Location ($.62 round trip): $${costOfGas} \n
My Free Estimate (includes gasoline): $${totalPrice + notarizationPrice + Number(costOfGas)} \n
${appointment !== '' && typeof appointment !== 'object'? `My Requested Appointment: ${appointment}` : ''}`)
    }, [nameInput, addressInput, totalPrice, notarizationPrice, costOfGas, emailValid])

    useEffect(() => {
        if (sessionStorage.getItem('servicesData') != null) {
            const serviceData = JSON.parse(sessionStorage.getItem('servicesData'));
            setSelectedServices(serviceData);
        }

        if (sessionStorage.getItem('totalPrice') != null) {
            const priceData = JSON.parse(sessionStorage.getItem('totalPrice'));
            setTotalPrice(priceData);
        }

        if (sessionStorage.getItem('addressData') != null) {
            const addressData = JSON.parse(sessionStorage.getItem('addressData'));
            setAddressInput(addressData);
        }

        if (sessionStorage.getItem('costOfGasData') != null) {
            const costOfGasData = JSON.parse(sessionStorage.getItem('costOfGasData'));
            setCostOfGas(costOfGasData);
        }

        if (sessionStorage.getItem('numOfNotarizations') != null) {
            const numOfNotarizationsData = JSON.parse(sessionStorage.getItem('numOfNotarizations'));
            setNumOfNotarizations(numOfNotarizationsData);
        }

        if (sessionStorage.getItem('notarizationPrice') != null) {
            const notarizationPriceData = JSON.parse(sessionStorage.getItem('notarizationPrice'));
            setNotarizationPrice(notarizationPriceData);
        }

        if (sessionStorage.getItem('nameData') != null) {
            const nameData = JSON.parse(sessionStorage.getItem('nameData'));
            setNameInput(nameData);
        }

        if (sessionStorage.getItem('emailData') != null) {
            const emailData = JSON.parse(sessionStorage.getItem('emailData'));
            setEmailInput(emailData);
        }

        if (sessionStorage.getItem('emailValidationData') != null) {
            const emailValidationData = JSON.parse(sessionStorage.getItem('emailValidationData'));
            setEmailValid(emailValidationData);
        }

        if (sessionStorage.getItem('phoneData') != null) {
            const phoneData = JSON.parse(sessionStorage.getItem('phoneData'))
            setNumberInput(phoneData);
        }
    }, []);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const data = Object.fromEntries(searchParams.entries());
        if (searchParams.size === 0 || data.appointmentDate == null) {
            return;
        } else {
            setAppointment(`${data.appointmentDate} @ ${data.appointmentTime}`)
        }
    }, [])

    useEffect(() => {
        const getAppointments = async () => {
            await axios.get(`http://${import.meta.env.VITE_IP_ADDRESS}/appointments`)
                .then((response) => response.data)
                .then(response => {
                    if (response.length !== 0) {
                        setAppointmentId(response[response.length - 1].appointmentid)
                    }});
        }
        getAppointments();
    }, [])

    return (
        <>
            <div id='quote-body'>
                <div id='quote-header-wrapper'>
                    <h1 id='your-free-quote'>Your Free Quote.</h1>
                    <p className='final-quote'>Services: ${totalPrice + notarizationPrice}</p>
                    <p className='final-quote'>Cost of Gas ($.62 Round Trip) : ${costOfGas}</p>
                    <p className='final-quote'>My Free Estimate: ${(totalPrice + notarizationPrice + (Number(costOfGas))).toFixed(2)}</p>
                </div>
                <div id='quote-calculator'>
                    <div className='input-wrapper'>
                        <label htmlFor='services-input' className='input-label'>Select Services</label>
                        <button className={`button-input ${isClicked ? 'clicked' : ''}`} 
                                name='services-input' type='button' 
                                onClick={handleClick}
                        >
                                {isClicked ? 'Click to Close' : 'Click to Open'}
                        </button>
                        <div id='services-menu'>
                            <ul id='services-list'>
                                {
                                    services.map((service) => {
                                        return (
                                            <>
                                                <ServiceLabelAndInput 
                                                    key={service.id}
                                                    id={service.id}
                                                    name={service.name}
                                                    price={service.price}
                                                    handleCheckboxChange={handleCheckboxChange}
                                                    checked={selectedServices.includes(service.id)}
                                                />
                                            </>
                                        );
                                    })
                                }
                                {selectedServices.includes(2) ? 
                                    servicesContd.map((service) => {
                                        return (
                                            <>
                                                <ServiceLabelAndInput 
                                                    key={service.id}
                                                    id={service.id}
                                                    name={service.name}
                                                    price={service.price}
                                                    handleCheckboxChange={handleCheckboxChange}
                                                    checked={selectedServices.includes(service.id)}
                                                />
                                            </>
                                        );
                                    }) : ''
                                }
                                {selectedServices.includes(3) ? 
                                    <li key={3} className='service-li-number'>
                                        <label className='service-label'>
                                            Number of Notarizations
                                            <input value={numOfNotarizations} 
                                                   type='number' 
                                                   id='number-input'
                                                   onChange={(event) => {
                                                    event.target.value < 0 || event.target.value == null ? setNumOfNotarizations(0) :
                                                    handleInputNumberChange(Number(event.target.value))}}
                                            />
                                        </label>
                                    </li>
                                    : ''
                                }
                            </ul>
                        </div>
                    </div>
                    <form className='input-wrapper' onSubmit={sendEmail}>
                        <FormLabelAndInput
                            label='Signing Location'
                            name='address'
                            type='text'
                            value={addressInput}
                            handleInputChange={handleInputChange}
                            placeholder='123 Main St, Anytown, AZ'
                            img={<img src={googleLogo} alt='google logo' id='google-logo'/>}

                        />
                        <PlacesAutocomplete inputValue={addressInput} onData={handleAddressData}/>
                        <label htmlFor='appointment-prompt' className='input-label appointment-prompt'>
                                {appointment !== '' && typeof appointment !== 'object' ? 'Choose a Different Appointment?' : 'Choose an Appointment? (optional)'}
                        </label>
                        <button className={`button-input ${appointmentSelectorOpen ? 'clicked' : ''}`} 
                                name='services-input' type='button' 
                                onClick={handleAppointmentClick}
                        >
                                {appointment !== '' && typeof appointment !== 'object' ? appointment : appointmentSelectorOpen ? 'Click to Close' : 'Click to Open'}
                        </button>
                        <div id='yes-no'>
                            <ul id='yes-no-selector'>
                                <label htmlFor='yes' className='yes-no-label yes'>
                                    Yes
                                </label>
                                <input type='checkbox' 
                                       value='yes' 
                                       onClick={changeAppointmentRequest}
                                       disabled={appointmentRequested != null && appointmentRequested === 'no'}/>
                                <label htmlFor='no' className='yes-no-label no'>
                                    No
                                </label>
                                <input type='checkbox' 
                                       value='no' 
                                       onClick={changeAppointmentRequest}
                                       disabled={appointmentRequested != null && appointmentRequested === 'yes'}/>
                            </ul>
                        </div>
                        <FormLabelAndInput
                            label='Name'
                            name='name'
                            type='text'
                            value={nameInput}
                            required={true}
                            placeholder='First Name, Last Name'
                            handleInputChange={handleInputChange}
                        />
                        <FormLabelAndInput
                            label='Phone Number (optional)'
                            name='number'
                            type='tel'
                            value={numberInput}
                            required={false}
                            placeholder='XXX-XXX-XXXX'
                            handleInputChange={handleInputChange}
                        />
                        <FormLabelAndInput
                            label='Email'
                            name='email'
                            type='email'
                            value={emailInput}
                            required={true}
                            placeholder='JaneDoe@email.com'
                            handleInputChange={handleInputChange}
                        />
                        <FormLabelAndInput
                            label={isDisabled || !emailValid? 'Message Us' : 'Feel free to add any additional information below.'}
                            name='email-content'
                            type='text'
                            value={isDisabled? 'If you would like to send us an email and request your chosen appointment, please first select all desired services and fill out all required fields. The send button will appear once all necessary fields are complete.' : emailSent? 
                            'Thank you! Your email was sent successfully, please check your email inbox for a confirmation.' : emailContent}
                            handleInputChange={handleInputChange}
                        />
                        <button id='send-button'  
                                disabled={isDisabled}
                                style={!emailValid || isDisabled || emailSent? {display: "none"} : {display: "block"}}
                                type='submit'
                        >
                                Send
                        </button>
                        <div className={emailSent == null? '' : emailSent? 'email sent' : 'email failed'}>
                            <div id='confirmation-symbol' />
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

function ServiceLabelAndInput(props) {
    const { id, name, price, handleCheckboxChange, checked} = props;

    return (
        <li key={id} className='service-li'>
            <label className='service-label'>
                {name === 'Notarization'? `Basic ${name}: Select Number Below` : `${name}: $${price}`}
                <input type='checkbox' 
                       className='service-input'
                       onChange={(event) => handleCheckboxChange(id, price)} 
                       checked={checked}
                />
            </label>
        </li>
    );
}

export function FormLabelAndInput(props) {
    const { name, type, handleInputChange, value, label, img, required, placeholder} = props;

    return (
        <>
            <label htmlFor={`input-${name}`} className={`input-label ${name}`}>
                {label}
                {img}
            </label>
            { name !== 'email-content' ?
            <input className={`input ${name}`}
                   name={`${name}-input`}
                   type={type}
                   value={value}
                   placeholder={placeholder}
                   onChange={handleInputChange}
                   required={required}
            /> : 
            <textarea className={`textarea ${name}`}
                      name={`${name}-input`}
                      type={type}
                      value={value}
                      onChange={handleInputChange}
            />
            }
        </>
    )
}