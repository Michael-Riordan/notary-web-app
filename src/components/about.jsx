import handshake from '../assets/undraw_business_deal_re_up4u.svg';

export default function About() {
    return (
        <>
            <section id='about-body'>
                <div id='about-header-wrapper'>
                    <div id='licensed-bonded-insured'>
                        <h1>Licensed. <br/> Bonded. <br/> Insured.</h1>
                        <img src={handshake} alt='handshake' id='handshake'/>
                    </div>
                    <h2 id='about-header'>LRmobilenotary is a professional mobile notary service based in the Phoenix area 
                        committed to providing reliable and efficient notarial services.
                         With a focus on convenience and customer satisfaction, LRmobilenotary 
                         offers flexible mobile notary services that cater to the diverse 
                         needs of individuals, businesses, and organizations.
                    </h2>
                </div>
                <article id='services-wrapper'>
                    <div className='about-service'>
                        <h1>Mobile Notary Service</h1>
                        <p>
                            LRmobilenotary offers the convenience of bringing notarial services directly 
                            to your preferred location. Rather than requiring you to visit a traditional notary office, 
                            LRmobilenotary will travel to your home, office, or any other mutually agreed-upon location. 
                            This is particularly beneficial for individuals or businesses with busy schedules 
                            or mobility constraints.
                        </p>
                        <p className='service-price'>$10 Per Notarial Act <br/>$.62/mi gasoline cost</p>
                    </div>
                    <div className='about-service'>
                        <h1>Loan Signing</h1>
                        <p>
                            By utilizing the services of an LRmobilenotary loan signing agent, borrowers and lenders can experience 
                            a streamlined loan signing process that offers flexibility, convenience, and professional expertise. 
                            Our agents play a crucial role in ensuring the accurate execution of loan documents, contributing to 
                            a successful real estate transaction.
                        </p>
                        <p className='service-price'>Loan Package: $175 <br/> Second Loan Package: $75 <br/> $.62/mi gasoline cost</p>
                    </div>
                    <div className='about-service'>
                        <h1>Corporate 3rd Party Representative</h1>
                        <p>
                            While utilizing LRmobilenotary as a corporate third-party representative, we combine our expertise in notarial services 
                            with the role of representing your company's interests. We perform official notarial acts, authenticate documents, 
                            ensure compliance with legal and regulatory requirements, handle client interactions, and mitigate risks.
                        </p>
                        <p className='service-price'>I-9 Form Verification: $50.00/hr <br/>$.62/mi gasoline cost</p>
                    </div>
                </article>
            </section>
        </>
    );
}