import { useEffect, useState } from "react";
import { useHistory, useLocation } from 'react-router-dom';
import axios from "axios";
import googleLogo from '/src/assets/google_on_white_hdpi.png'
import emailjs from '@emailjs/browser'
import PlacesAutocomplete from "./PlacesAutocomplete";
import { Helmet } from "react-helmet";


export default function Quote() {
    const [isClicked, setIsClicked] = useState(false);
    const [appointmentSelectorOpen, setAppointmentSelectorOpen] = useState(false);
    const [appointmentRequested, setAppointmentRequested] = useState(null);
    const [selectedServices, setSelectedServices] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [numOfNotarizations, setNumOfNotarizations] = useState(0);
    const [numOfLoanPackages, setNumOfLoanPackages] = useState(0);
    const [notarizationPrice, setNotarizationPrice] = useState(0);
    const [additionalLoanPackagePrice, setAdditionLoanPackagePrice] = useState(0);
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
    const [finalPrice, setFinalPrice] = useState(0);
    const [emailContent, setEmailContent] = useState('');

    const SESSIONDATA = {
        addressData: addressInput,
        totalPrice: totalPrice,
        servicesData: selectedServices,
        notarizationPrice: notarizationPrice,
        additionalLoanPackagePrice: additionalLoanPackagePrice,
        numOfNotarizations: numOfNotarizations,
        numOfLoanPackages: numOfLoanPackages,
        costOfGasData: costOfGas,
        nameData: nameInput,
        emailData: emailInput,
        emailValidationData: emailValid,
        phoneData: numberInput,
        finalPrice: finalPrice,
    }

    const history = useHistory();
    const location = useLocation();

    const services = [
        {id: 0, name: 'Acknowledgement', price: 10},
        {id: 1, name: 'Jurat', price: 10},
        {id: 2, name: 'Loan Package', price: 175},
        {id: 3, name: 'Notarization', price: '', notarizations: numOfNotarizations},
        {id: 4, name: 'I-9 Verification (hourly)', price: 50},
        {id: 5, name: 'Job Application Resume Service', price: 30},

    ];
   
    const handleClick = () => {
        setIsClicked(!isClicked);
    }

    const handleAppointmentClick = () => {
        setAppointmentSelectorOpen(!appointmentSelectorOpen);
    }

    const changeAppointmentRequest = (event) => {
        const value = event.target.value;
        if (appointmentRequested == null) {
            setAppointmentRequested(value);
            if (value === 'yes' && appointment === '') {
                saveToSessionStorage();
                history.push('./appointment')
            } else if (value === 'yes' && appointment !== '') {
                saveToSessionStorage();
                axios.delete(`http://${import.meta.env.VITE_IP_ADDRESS}/deleteAppointment/${appointmentId}`)
                history.push('./appointment')
            } else {
                return
            };
        } else {
            setAppointmentRequested(null);
        };
    };

    const saveToSessionStorage = () => {

        Object.entries(SESSIONDATA).forEach(([key, value]) => {
            sessionStorage.setItem(key, JSON.stringify(value));
        });
    };

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
                if (numOfLoanPackages !== 0) {
                    setTotalPrice(totalPrice - 175);
                    setNumOfLoanPackages(0);
                    setAdditionLoanPackagePrice(0);
                    return prevSelectedServices.filter((id) => id !== 2)
                } else {
                    setTotalPrice(totalPrice - 175);
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

    const handleKeyDown = (event, id, price) => {
        if (event.key === 'Enter') {
            handleCheckboxChange(id, price);
            event.preventDefault();
            event.target.click();   
        }
    };

    const handleInputNumberChange = (numberOfNotarizations) => {
        setNumOfNotarizations(numberOfNotarizations);
        const price = (numberOfNotarizations * 10);
        setNotarizationPrice(price);
    };
    
    const handleNumOfLoanPackageChange = (numOfLoanPackages) => {
        setNumOfLoanPackages(numOfLoanPackages);
        const price = (numOfLoanPackages * 75);
        setAdditionLoanPackagePrice(price);
    }

    // Handles Data passed up DOM tree from PlacesAutocomplete Child Component
    const handleAddressData = (address) => {
        setPlaceId(address.place_id);
        setAddressInput(address.description);
    }

    const handleInputChange = (event) => {
        const inputClass = event.target.className;
        const inputValue = event.target.value;

        switch (inputClass) {
            case 'input name':
                setNameInput(inputValue);
                break;
            
            case 'input email':
                setEmailInput(inputValue);
                event.target.validity.valid? setEmailValid(true) : setEmailValid(false);
                break;

            case 'textarea email-content':
                setEmailContent(inputValue);
                break;

            case 'input address':
                setAddressInput(inputValue);
                break;

            case 'input number':
                console.log(inputValue, 'inputChangeHandler');
                setNumberInput(inputValue);
                break;

            default:
                console.log('Unexpected Case Input');
        }
    };

    const sendEmail = (event) => {
        event.preventDefault();

        if (event.key === 'Enter') {
            return;
        }

        const templateParams = {
            from_name: nameInput,
            message: emailContent,
            to_name: 'Laurie',
            reply_to: emailInput,
        }

        emailjs.send(import.meta.env.VITE_EMAIL_JS_SERVICE_ID, import.meta.env.VITE_EMAIL_JS_TEMPLATE_ID, templateParams, import.meta.env.VITE_EMAIL_JS_PUBLIC_KEY)
            .then((result) => {
                setEmailSent(true);
            }, (error) => {
                setEmailSent(false);
                console.error(error);
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
        const calculateFinalPrice = () => {
            return totalPrice + notarizationPrice + additionalLoanPackagePrice + (Number(costOfGas))
        }

        setFinalPrice(calculateFinalPrice());
    }, [totalPrice, notarizationPrice, additionalLoanPackagePrice, costOfGas])

    useEffect(() => {
        !emailValid? setEmailContent('Please Enter a Valid Email Address.') :
        setEmailContent(`Hello LRmobilenotary, \n    My name is ${nameInput} and I'm inquiring about your notary services. \n 
Here is my info: \n
My Preferred Signing Location: ${addressInput} \n
Cost of Gas to Signing Location ($.62 round trip): $${costOfGas} \n
My Free Estimate (includes gasoline): $${finalPrice} \n
${appointment !== '' && typeof appointment !== 'object'? `My Requested Appointment: ${appointment}` : ''} \n
${numberInput === ''? '' : `Call/Text me at ${numberInput}`}`)
    }, [emailValid, nameInput, costOfGas, finalPrice, appointment, numberInput]);

    useEffect(() => {
        Object.entries(SESSIONDATA).forEach(([key]) => {
            const storedData = sessionStorage.getItem(key);

            switch (key) {
                case 'servicesData':
                    if (storedData != null) {
                        setSelectedServices(JSON.parse(storedData));
                    }
                    break;

                case 'totalPrice':
                    if (storedData != null) {
                        setTotalPrice(JSON.parse(storedData));
                    }
                    break;

                case 'addressData':
                    if (storedData != null) {
                        setAddressInput(JSON.parse(storedData));
                    }
                    break;

                case 'costOfGasData':
                    if (storedData != null) {
                        setCostOfGas(JSON.parse(storedData));
                    }
                    break;
                
                case 'numOfNotarizations':
                    if (storedData != null) {
                        setNumOfNotarizations(JSON.parse(storedData));
                    }
                    break;

                case 'notarizationPrice':
                    if (storedData != null) {
                        setNotarizationPrice(JSON.parse(storedData));
                    }
                    break;

                case 'additionalLoanPackagePrice':
                    if (storedData != null) {
                        setAdditionLoanPackagePrice(JSON.parse(storedData));
                    }
                    break;

                case 'numOfLoanPackages':
                    if (storedData != null) {
                        setNumOfLoanPackages(JSON.parse(storedData));
                    }
                    break;

                case 'nameData':
                    if (storedData != null) {
                        setNameInput(JSON.parse(storedData));
                    }
                    break;

                case 'emailData':
                    if (storedData != null) {
                        setEmailInput(JSON.parse(storedData));
                    }
                    break;

                case 'emailValidationData':
                    if (storedData != null) {
                        setEmailValid(JSON.parse(storedData));
                    }
                    break;

                case 'finalPrice':
                    if (storedData != null) {
                        setFinalPrice(JSON.parse(storedData));
                    }
                    break;

                case 'phoneData':
                    if (storedData != null) {
                        setNumberInput(JSON.parse(storedData));
                    }
                    break;   
                
                default:
                    console.log('Unexpected Case Data');
                    break;
            }
        })      
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

    useEffect(() => {

        const handleUnload = (event) => {
            if (emailSent == null && appointment !== '' ) {
                event.preventDefault();
            }
        }
        
        window.addEventListener('beforeunload', handleUnload);

        return () => {
            window.removeEventListener('beforeunload', handleUnload);
        }
    }, [emailSent, appointment]);

    return (
        <>
            <Helmet>
                <title>Free Quote and Appointment Request | LRmobilenotary</title>
                <meta name='description' content='Get a free quote and request an appointment for mobile notary services in Arizona' />
            </Helmet>

            <section id='quote-body'>
                <div id='quote-header-wrapper'>
                    <h1 id='your-free-quote'>Your Free Quote.</h1>
                    <p className='final-quote'>Services: ${totalPrice + notarizationPrice + additionalLoanPackagePrice}</p>
                    <p className='final-quote'>Cost of Gas ($.62 Round Trip) : ${costOfGas}</p>
                    <p className='final-quote'>My Free Estimate: ${finalPrice}</p>
                </div>

                <section id='quote-calculator'>
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
                                                    onKeyDown={handleKeyDown}
                                                    handleCheckboxChange={handleCheckboxChange}
                                                    checked={selectedServices.includes(service.id)}
                                                />
                                            </>
                                        );
                                    })
                                }
                                {selectedServices.includes(2) &&
                                            <li key={6} className='service-li-number'>
                                                <label className='service-label'>
                                                    Additional Loan Packages: $75
                                                    <input value={numOfLoanPackages}
                                                           type='number'
                                                           id='number-input'
                                                           onKeyDown={handleKeyDown}
                                                           onChange={(event) => {
                                                            event.target.value < 0 || event.target.value == null ? setNumOfLoanPackages(0) :
                                                            handleNumOfLoanPackageChange(Number(event.target.value))}}
                                                    />
                                                </label>
                                            </li>
                                }
                                {selectedServices.includes(3) && 
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
                            label={isDisabled || !emailValid? 'Message Us' : `Feel free to add any additional information.`}
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
                </section>
            </section>
        </>
    );
}

function ServiceLabelAndInput(props) {
    const { id, name, price, handleCheckboxChange, checked, onKeyDown} = props;

    return (
        <li key={id} className='service-li'>
            <label className='service-label'>
                {name === 'Notarization'? `Basic ${name}: Select Number Below` : `${name}: $${price}`}
                <input type='checkbox' 
                       className='service-input'
                       onChange={(event) => handleCheckboxChange(id, price)} 
                       checked={checked}
                       onKeyDown={(event) => onKeyDown(event, id, price)}
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