import { useState, useEffect } from 'react';
import { Message, Chat } from '@prisma/client';
import axios from 'axios';

interface ChatWithMessages extends Chat {
  messages?: Message[];
}

export function useChatHistory(pubKey: string) {
  const [chats, setChats] = useState<ChatWithMessages[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatWithMessages | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load chats from localStorage
  useEffect(() => {
    if (pubKey) {
      loadChats();
    }
  }, [pubKey]);

  // Update currentChat when chats change
  useEffect(() => {
    if (currentChat) {
      const updatedChat = chats.find(chat => chat.id === currentChat.id);
      if (updatedChat) {
        setCurrentChat(updatedChat);
      }
    }
  }, [chats]);

  const loadChats = async () => {
    setIsLoading(true);
    try {
      // First load from localStorage
      const cachedChats = localStorage.getItem(`chat_cache_${pubKey}`);
      if (cachedChats) {
        setChats(JSON.parse(cachedChats));
      }

      // Try to fetch from database, but don't block if it fails
      try {
        const response = await axios.get(`/api/chats?pubKey=${pubKey}`);
        const serverChats = response.data.chats;
        setChats(serverChats);
        localStorage.setItem(`chat_cache_${pubKey}`, JSON.stringify(serverChats));
      } catch (error) {
        console.log('Could not load chats from server, using local cache');
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createChat = async () => {
    // Create a temporary chat immediately for local use
    const tempChat: ChatWithMessages = {
      id: `temp-${Date.now()}`,
      title: 'New Chat',
      userId: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      isArchived: false,
      messages: []
    };

    // Update state with the temporary chat
    setChats(prev => {
      const newChats = [...prev, tempChat];
      localStorage.setItem(`chat_cache_${pubKey}`, JSON.stringify(newChats));
      return newChats;
    });
    setCurrentChat(tempChat);

    // Try to persist to database, but don't block if it fails
    try {
      const response = await axios.post('/api/chats', { pubKey });
      const newChat = response.data.chat;
      
      // Update state with the server chat
      setChats(prev => {
        const newChats = prev.map(chat => chat.id === tempChat.id ? newChat : chat);
        localStorage.setItem(`chat_cache_${pubKey}`, JSON.stringify(newChats));
        return newChats;
      });
      setCurrentChat(newChat);
      return newChat;
    } catch (error) {
      console.log('Could not save chat to server, using local chat');
      return tempChat;
    }
  };

  const sendMessage = async (chatId: string, content: string, sender: 'User' | 'System', metadata?: any) => {
    // Create temporary message
    const tempMessage = {
      id: `temp-${Date.now()}`,
      content,
      sender,
      chatId,
      createdAt: new Date(),
      metadata
    };

    // Update local state immediately
    setChats(prev => {
      const newChats = prev.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: [...(chat.messages || []), tempMessage],
            updatedAt: new Date()
          };
        }
        return chat;
      });
      localStorage.setItem(`chat_cache_${pubKey}`, JSON.stringify(newChats));
      return newChats;
    });

    // Only try to save to server if it's not a temporary chat
    if (!chatId.startsWith('temp-')) {
      try {
        const response = await axios.post(`/api/chats/${chatId}/messages`, {
          content,
          sender,
          metadata
        });
        const savedMessage = response.data.message;

        // Update state with the saved message
        setChats(prev => {
          const newChats = prev.map(chat => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: chat.messages?.map(msg => 
                  msg.id === tempMessage.id ? savedMessage : msg
                ) || []
              };
            }
            return chat;
          });
          localStorage.setItem(`chat_cache_${pubKey}`, JSON.stringify(newChats));
          return newChats;
        });

        return savedMessage;
      } catch (error) {
        console.error('Could not save message to server:', error);
      }
    }

    return tempMessage;
  };

  return {
    chats,
    currentChat,
    setCurrentChat,
    createChat,
    sendMessage,
    isLoading,
  };
}