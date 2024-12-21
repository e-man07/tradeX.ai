import { ArrowUp } from "lucide-react";

export default function ChatArea() {
    return (
        <div className="">
        <h1 className=" font-semibold tracking-tight text-2xl md:text-3xl text-white text-center mb-6">
          What do you want to perform?
        </h1>
        
        <div className="border bg-[#131313] shadow-inner shadow-white/5 rounded-xl p-6 px-5 flex items-center gap-2">
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              placeholder="Ask kira to perform solana actions..."
              className="bg-transparent text-sm text-white flex-1 outline-none md:w-[500px]"
            />
          </div>
          <div className="flex items-center">
            <div className="px-2 shadow-inner shadow-black/80 bg-white text-black py-1 rounded-full">
            <ArrowUp className="w-4"/>
            </div>
          </div>
        </div>
      </div>
    );
  }
  