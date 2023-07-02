import { useEffect, useState } from "react";
import googleLogo from '/src/assets/google_on_white_hdpi.png'
import emailjs from '@emailjs/browser'
import PlacesAutocomplete from "./PlacesAutocomplete";

export default function Quote() {
    const [isClicked, setIsClicked] = useState(false);
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
    const [emailContent, setEmailContent] = useState(`Hello LRmobilenotary, \n    My name is ${nameInput} and I'm inquiring about your notary services. Here is my info: \n \n
My Preferred Signing Location: ${addressInput} \n
Cost of Gas to Signing Location ($${.62} round trip): ${costOfGas} \n
My Free Estimate: ${totalPrice + notarizationPrice + Number(costOfGas)}`)


    const services = [
        {id: 0, name: 'Acknowledgement', price: 10},
        {id: 1, name: 'Jurat', price: 10},
        {id: 2, name: 'Loan Package', price: 125},
        {id: 3, name: 'Notarization', price: 10, notarizations: numOfNotarizations},
    ];

    /*created servicesContd to conditionally load in this service as a list item*/
    const servicesContd = [
        {id: 4, name: 'Second Loan Package', price: 50}
    ];

    
    const handleClick = () => {
        setIsClicked(!isClicked);
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
        } else if (event.target.className === 'textarea email-content') {
            setEmailContent(event.target.value);
        } else if (event.target.className === 'input address') {
            setAddressInput(event.target.value);
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
        setEmailContent(`Hello LRmobilenotary, \n    My name is ${nameInput} and I'm inquiring about your notary services. \n 
Here is my info: \n
My Preferred Signing Location: ${addressInput} \n
Cost of Gas to Signing Location ($.62 round trip): $${costOfGas} \n
My Free Estimate (includes gasoline): $${totalPrice + notarizationPrice + Number(costOfGas)}`)
    }, [nameInput, addressInput, totalPrice, notarizationPrice, costOfGas])


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
                    <form className='input-wrapper'>
                        <FormLabelAndInput
                            label='Signing Location'
                            name='address'
                            type='text'
                            value={addressInput}
                            handleInputChange={handleInputChange}
                            img={<img src={googleLogo} alt='google logo' id='google-logo'/>}

                        />        
                        <PlacesAutocomplete inputValue={addressInput} onData={handleAddressData}/>
                        <FormLabelAndInput
                            label='Name'
                            name='name'
                            type='text'
                            value={nameInput}
                            handleInputChange={handleInputChange}
                        />
                        <FormLabelAndInput
                            label='Email'
                            name='email'
                            type='text'
                            value={emailInput}
                            handleInputChange={handleInputChange}
                        />
                        <FormLabelAndInput
                            label='Message'
                            name='email-content'
                            type='email'
                            value={isDisabled? 'If you would like to send us an email, please first select all desired services and fill out all fields.' : emailSent? 
                            'Thank you! Your email was sent successfully, please check your email inbox for a confirmation.' : emailContent}
                            handleInputChange={handleInputChange}
                        />
                        <button id='send-button' onClick={sendEmail} 
                                                 disabled={isDisabled}
                                                 style={isDisabled || emailSent? {display: "none"} : {display: "block"}}>
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
    const { id, name, price, handleCheckboxChange } = props;

    return (
        <li key={id} className='service-li'>
            <label className='service-label'>
                {name}: ${price}
                <input type='checkbox' className='service-input' onChange={() => handleCheckboxChange(id, price)} />
            </label>
        </li>
    );
}

function FormLabelAndInput(props) {
    const { name, type, handleInputChange, value, label, img} = props;

    return (
        <>
            <label htmlFor={`input-${name}`} className={'input-label'}>
                {label}
                {img}
            </label>
            { type === 'text' ?
            <input className={`input ${name}`}
                   name={`${name}-input`}
                   type={`${type}`}
                   value={value}
                   onChange={handleInputChange}
                   required
            /> : 
            <textarea className={`textarea ${name}`}
                      name={`${name}-input`}
                      type={`${type}`}
                      value={`${value}`}
                      onChange={handleInputChange}
            />
            }
        </>
    )
}