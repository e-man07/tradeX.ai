"use client";

import React, { useState } from "react";
import Wallet from "@/components/Wallet";
import {useWallet} from "@/hooks/useWallet";
import Chat from "@/components/Chat";
import { useSolanaAgent } from "@/hooks/useSolanaAgent";

export default function Agent() {
  const {isAuthenticated}=useWallet();
  if(isAuthenticated){
    useSolanaAgent();
    return(<Chat/>)
  }else{
    return(<Wallet/>)
  }
}
