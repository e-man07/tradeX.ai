import {useWallet} from "@/hooks/useWallet";
import React from "react";
import Wallet from "./Wallet";

const Chat = () => {
  const {
    pubKey,
    secKey,
    showKey,
    toggleKeyVisibility,
    logout
  } = useWallet();


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Welcome to Your Dashboard</h1>
      <p className="text-lg mb-4">Your Public Key: {pubKey}</p>
      {showKey && <p className="text-lg mb-4">Your Private Key: {secKey}</p>}
      {showKey ? (
        <button
          onClick={() => toggleKeyVisibility()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mb-4"
        >
          Hide Private Key
        </button>
      ) : (
        <button
          onClick={() => toggleKeyVisibility()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mb-4"
        >
          Show Private Key
        </button>
      )}
      <button
        onClick={logout}
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
};

export default Chat;
