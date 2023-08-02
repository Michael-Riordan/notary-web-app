import { useEffect, useState} from "react";

export default function PlacesAutocomplete({ inputValue, onData}) {
    const [data, setData] = useState([]);
    const [selected, setSelected] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState('');

    /* fetching from server side code (/vite-react-server/server.js) that calls google api */
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (inputValue !== selectedAddress) {
                    setSelected(false);
                }
                const response = await fetch(`http://${import.meta.env.SERVER_DOMAIN}/api/places?query=${encodeURIComponent(inputValue)}`);
                const responseData = await response.json();
                const addressPredictions = responseData.predictions;
                setData(addressPredictions);
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [inputValue]);

    /* passing address data back to parent (Quote)*/
    const handleAddressSelection = (address) => {
        setSelected(true);
        const data = address
        setSelectedAddress(address.description);
        onData(data);
    }

    return (
        <>
            <div id='address-list'>
                <ul>
                    {
                        data.map((address, index) => (
                            <li key={index} 
                                className='address-list-item' 
                                onClick={() => handleAddressSelection(address)} 
                                style={{ display: selected ? 'none' : 'inherit'}}
                            >
                                {address.description}
                            </li>
                        ))
                    }
                </ul>
            </div>
        </>
    )
}