import { useWallet } from "@solana/wallet-adapter-react";

function DisplayAddress() {
    const { publicKey } = useWallet();

    return (
        <div>
            {publicKey ? <p>Your wallet address is: {publicKey.toBase58()}</p> : <p>Please connect your wallet first.</p>}
        </div>
    );
}
export default DisplayAddress;