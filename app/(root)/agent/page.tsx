"use client";

import React, { useState } from "react";
import Wallet from "@/component/Wallet";
import {useWallet} from "@/hooks/useWallet";
import Chat from "@/component/Chat";

export default function Agent() {
  const {isAuthenticated}=useWallet();
  if(isAuthenticated){
    return(<Chat/>)
  }else{
    return(<Wallet/>)
  }
}
