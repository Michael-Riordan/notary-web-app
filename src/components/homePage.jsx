import { Link } from "react-router-dom";

export default function Home() {

    return (
        <>
            <meta name='description' content='LRmobilenotary - Certified Mobile Notary in Arizona. Trusted and reliable mobile notary services for notarization, loan signing, and I-9 verification.' />
            <section id='homepage-head' role='banner'>
                <div id='header-section'>
                    <div id='company-logo'>
                        <h1 id='company-name' aria-label='Laurie A. Riordan - Certified Notary Public'>
                            Laurie A. Riordan
                        </h1>
                        <h1 id='company-name-continued'>
                            Arizona Based Certified Notary Public
                        </h1>                            
                        <h2 id='head-quote' aria-label=''>
                            "A notary is not merely a witness, but a guardian of truth and trust"
                        </h2>
                    </div>
                </div>
            </section>
            <section id='homepage-body'>
                <h1 id='body-header'>Convenient. Certified. Caring.</h1>
                <p id='body-p'>
                    LRmobilenotary is a professional mobile notary service based in the Phoenix area committed to providing reliable and 
                    efficient notarial services. With a focus on convenience and customer satisfaction, we offer flexible 
                    mobile notary services that cater to the diverse needs of individuals, businesses, and organizations.
                </p>
                <div id='contact-us-button'>
                    <Link id='call-now' to='/quote'>Contact Us</Link>
                </div>
            </section>
        </>
    );
}