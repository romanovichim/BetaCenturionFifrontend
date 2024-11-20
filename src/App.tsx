import './App.css';

import { Button, Card, Col, Container, Nav, Navbar, Row} from 'react-bootstrap';
import { Routes, Route, Outlet, Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import { TonConnectButton } from '@tonconnect/ui-react';



// Pages
import Offers from './pages/offers';
import Lend from './pages/lend';
import Borrow from './pages/borrow';
import Loans from './pages/loans';
import Help from './pages/help';

function App() {


  return (
    <>
    <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="Lend" element={<Lend />} />
          <Route path="offers" element={<Offers/>} />
          <Route path="Borrow" element={<Borrow />} />
          <Route path="Loans" element={<Loans />} />
          <Route path="Help" element={<Help />} />
          {/* Using path="*"" means "match anything", so this route
                acts like a catch-all for URLs that we don't have explicit
                routes for. 
                          
          
          <Route path="Borrow" element={<Borrow />} />
          <Route path="Loans" element={<Loans />} />
          <Route path="Apy" element={<Apy/>} />
          <Route path="How" element={<How/>} />
                
                */}
          <Route path="*" element={<NoMatch />} />
        </Route>
      </Routes>

    </>
  );
}

function Layout() {
  return (
    <div>
      {/* A "layout route" is a good place to put markup you want to
          share across all the pages on your site, like navigation. 
          <Nav.Link><Link to="/nothing-here" style={{ textDecoration: 'none' }}>Nothing Here</Link></Nav.Link>*/}

    <Navbar data-bs-theme="dark" expand="lg" className="bg-body-tertiary">
      <Container>
      <Navbar.Brand href="/">Centurion <strong>Beta</strong></Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="m-auto">
            <Nav.Link><Link to="/lend" style={{ textDecoration: 'none',color: 'inherit' }}>Lend</Link></Nav.Link>
            <Nav.Link><Link to="/offers" style={{ textDecoration: 'none',color: 'inherit' }}>Offers</Link></Nav.Link>
            <Nav.Link href="#" disabled>
              /
            </Nav.Link>
            <Nav.Link><Link to="/borrow" style={{ textDecoration: 'none',color: 'inherit' }}>Borrow</Link></Nav.Link>
            <Nav.Link><Link to="/loans" style={{ textDecoration: 'none',color: 'inherit' }}>Loans</Link></Nav.Link>
          </Nav>
        </Navbar.Collapse>
        <TonConnectButton />
      </Container>
    </Navbar>


      {/* An <Outlet> renders whatever child route is currently active,
          so you can think about this <Outlet> as a placeholder for
          the child routes we defined above. */}
      <Outlet />
    </div>
  );
}

function Home() {

return (
  
  <div className="vh-100 bg-dark" style={{ backgroundImage:
    "url('https://gist.github.com/user-attachments/assets/9469da4d-4c1e-4fa1-93e4-36e130a91426')" }}>
  <Container fluid className="py-4 " data-bs-theme="dark">
  <Row>
        <Col sm={7} className="text-center">
        <p style={{ fontSize: "70px", fontWeight: "600",textShadow: "2px 2px #c13ea9" }} className="text-white">BORROW & LEND</p>
        <p style={{ fontSize: "70px", fontWeight: "600",textShadow: "2px 2px #c13ea9" }} className="text-white">AGAINST YOUR</p>
        <p style={{ fontSize: "70px", fontWeight: "600",textShadow: "2px 2px #c13ea9" }} className="text-white">NFTS,INSTANTLY</p>
        <div >
          <Button  variant="primary" size="lg" className="m-3">
            <Link to="/lend" style={{ textDecoration: 'none',color: 'inherit' }}>Lend</Link>
          </Button>
          <Button variant="secondary" size="lg" className="m-3">
            <Link to="/borrow" style={{ textDecoration: 'none',color: 'inherit' }}>Borrow</Link>
          </Button>
        </div>

        </Col>
        <Col sm={3}>
        <br />
        <br />
        <br />
        <br />
        <Card className="shadow" style={{ width: '18rem' }}>
          <Card.Body>
            <Card.Title>Centurion</Card.Title>
            <br />
            <br />
            <Card.Text>
            Make money as a lender.
            <br />
            Get cash as a borrower.
            <br />
            <br />
            <Link to="/help" >Read the Bitepaper <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M7.00015 6H18.0002V17H16.0002V9.41421L7.00015 18.4142L5.58594 17L14.5859 8H7.00015V6Z" fill="white"/></svg></Link> 
            </Card.Text>
          </Card.Body>
        </Card>
        </Col>
  </Row>
  <br />
<br /> 



</Container>
</div>




);
}


function NoMatch() {
  return (
    <div className="vh-100 bg-dark">
    <Container fluid className="py-4 text-center" data-bs-theme="dark">
  <h1 style={{ fontSize: "30px", fontWeight: "175"  }} className="text-white">This is a 404 page, go to our home page or our <a href="https://t.me/ton_learn">community</a></h1>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
  </Container>
  </div>
  
  );
}






export default App;




