import { Col, Container,Image, Row } from "react-bootstrap";


const Help = () => {
const name = "Centurion"

return(
<>
        
    <div className=" bg-dark" >
      <Row>
      <Col></Col>
      <Col xs={6}>
      <Container fluid className="py-4 " data-bs-theme="dark">
        <h1 className="text-white">{name}: a bitepaper</h1>
        <h2 className="text-white">{name} Goal</h2>
        <p className="text-white"> {name} aims to change the game of NFT market. NFTs will no longer be seen as illiquid graveyards. NFTs gain new utility through borrowing, and launch into a new era of growth. Increasing TON's TVL</p>
        <h2 className="text-white">What does {name} do?</h2>
        <p className="text-white">{name} is a platform where anyone can make loan offers for NFTs in a collection on TON blockchain, and holders choose the NFT, left-click-borrow instantly. You make money as a lender. You get cash on-demand as a borrower.</p>
        <p className="text-white">You can think of {name} as decentralized, demand-driven, NFT-backed loans. Borrowers can use any NFT from the collection to get a loan. And lenders bid on a mystery NFT from the verified collection</p>
        
        <h2 className="text-white">How does {name} do this?</h2>

        <p className="text-white">{name} is a zero-sum game.Short term loans usually have high interest, so Lenders can stand to make a lot of money in a short amount of time. Borrowers may have immediate need for cash now.e connect the Lender and Borrower, and they both get a good deal. Even in the case where the Borrower fails to pay the loan back, the Lender is still protected because the NFT is worth more than what they paid to offer the loan. Make sense? Details on how this works below.</p>
        <h2 className="text-white">How do borrowers get the best deal?</h2>
        <p className="text-white">In our protocol we use NFTs of specific collection as collaterial.he offers book is just where we store all the offers you can get for a loan. And when you borrow, we give you the best deal in the book. The best part is, lenders can make offers any time. This is the key to {name}’s convenience — instant loans. So when you need cash, you always get the current best deal.</p>

        <h1 className="text-white">Learn {name}</h1>
        
        <h2 className="text-white">What does a loan look like?</h2>

        <Image src="https://gist.github.com/user-attachments/assets/8388db44-681d-459f-aabe-71ab2cfce29f.jpg" fluid />

        <h2 className="text-white">What is APY?</h2>
        <p className="text-white">Lenders look for annual percentage yield, or APY. The higher the better, because that corresponds with how much they make for successfully offering a loan. Usually higher APY indicates higher risk.A large APY occurs due to a high rate for a short period, for example, interest up to 5.2% for 14 days compounded over a year will lead to 160% APY!!!</p>

        <h1 className="text-white">Use {name}</h1>
        <h2 className="text-white">🚧 How to Lend</h2>
        <p className="text-white">To be a savvy Lender, you have to find your balance between following questions.</p>
        <h3 className="text-white">How much would I pay to get this NFT at a discount?</h3>
        <p className="text-white">In the case of a default, you get the NFT instead of your loan payment. So you should be comfortable with your loan offer in exchange for the NFT. You obviously want to pay as low of a cost as possible for this consideration.</p>
        <h3 className="text-white">How quickly do I want the loan to be accepted?</h3>
        <p className="text-white">The reason you shouldn’t offer 0.001 TON, is that it’s a terrible deal for the Borrower, and they may not ever take your offer. If your offer is always lower than what other Lenders offer, then it could be a long time, if ever, before your loan is accepted.</p>
        <h3 className="text-white">How much do I believe in the value of the collection?</h3>
        <p className="text-white">The main risk Lenders have to consider, is the event of the NFT’s value dropping below the loan offer. E.g. you think the NFT is worth 100 SOL, but tomorrow you think the value is now 99 TON, then if the Borrower defaults, you lost money. This is why Lenders often choose to over-collateralize, meaning they offer lower than what they think the NFT is worth. It’s up to you and your bullishness on a project. Maybe you think the value would go up, and no chance of it going down.</p>
        <h3 className="text-white">How much do I want to make?</h3>
        <p className="text-white">The higher the loan offer, the more yield you will make, since the yield is based on a percentage.</p>

        <h2 className="text-white">🚧 How to Borrow</h2>
        <p className="text-white">Each collection will have a “best offer” that you can see. If you know how much you need, pick the lowest loan offer that still covers your needs. This reduces the amount of interest you have to pay on the loan.</p>

        <h3 className="text-white">Choosing a collection</h3>
        <p className="text-white">Since NFTs in a collection are regarded as equal, you don’t need to pick your super rare NFT as collateral. Rather, you can pick an NFT you’re comfortable parting with. That way, in the unlikely event of a default, you don’t lose a sentimental NFT.</p>

        <h3 className="text-white">Choosing an NFT</h3>
        <p className="text-white">Since NFTs in a collection are regarded as equal, you don’t need to pick your super rare NFT as collateral. Rather, you can pick an NFT you’re comfortable parting with. That way, in the unlikely event of a default, you don’t lose a sentimental NFT.</p>

        <h3 className="text-white">Choosing an offer</h3>
        <p className="text-white">This is not yet available in the MVP launch. But theoretically, similarly to choosing a collection, you want to pick a loan offer that covers your needs but isn’t overkill.</p>


        <h1 className="text-white">Tech docs</h1>     
        <p className="text-white">Smart contracts and technical description of actors and data flows, as well as API - <a href="https://t.me/ton_learn">here</a></p>

        <h1 className="text-white">Community</h1> 
        <p className="text-white"><a href="https://t.me/ton_learn">JOIN</a></p>

      </Container>
      </Col>
      <Col></Col>
      </Row>
    </div>


</>
);
}


export default Help;