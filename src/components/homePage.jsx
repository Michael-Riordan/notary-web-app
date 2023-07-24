import { Helmet } from 'react-helmet';

export default function Home() {
    return (
        <>
            <Helmet>
                <title>
                    LRmobilenotary - Certified Notary Public and Mobile Signing Agent in Arizona
                </title>
                <meta name='description' content='LRmobilenotary - Certified Mobile Notary in Arizona. Trusted and reliable mobile notary services for notarization, loan signing, and I-9 verification.' />
            </Helmet>
            <section id='app-head' role='banner'>
                <div id='header-section'>
                    <div id='company-logo'>
                        <h1 id='company-name' aria-label='Laurie A. Riordan - Certified Notary Public'>
                            Laurie A. Riordan <br/> Certified Notary Public
                        </h1>                            
                        <h2 id='head-quote' aria-label=''>
                            "A notary is not merely a witness, but a guardian of truth and trust"
                        </h2>
                    </div>
                </div>
            </section>
        </>
    );
}