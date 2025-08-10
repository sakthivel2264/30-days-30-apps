"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { socket } from "@/lib/socket";
import { Message, User } from "@/types";
import api from "@/lib/api";
import { 
  Search, 
  MoreVertical, 
  Smile, 
  Paperclip, 
  Mic, 
  Send,
  ArrowLeft,
  Phone,
  Video,
  Check,
  CheckCheck
} from "lucide-react";

// Extended Message interface with status
interface ExtendedMessage extends Message {
  messageId: string;
  status?: 'sent' | 'delivered' | 'read';
  timestamp: number;
}

export default function ChatPage() {
  const { token, userId, username, loadAuthFromCookies } = useAuthStore();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userStatuses, setUserStatuses] = useState<Record<string, string>>({});
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadAuthFromCookies();
  }, []);

  useEffect(() => {
    if (!token || !userId) return;

    socket.auth = { token };
    socket.connect();

    // Notify server of user coming online
    socket.emit('user_online');

    // Listen for incoming messages
    socket.on("receive_message", (msg: ExtendedMessage) => {
      const formattedMsg: ExtendedMessage = {
        messageId: msg.messageId,
        from: msg.from,
        to: msg.to,
        content: msg.content,
        timestamp: msg.timestamp,
        status: msg.status || 'delivered'
      };

      if (
        (msg.from === userId && msg.to === selectedUser?._id) ||
        (msg.from === selectedUser?._id && msg.to === userId)
      ) {
        setMessages((prev) => {
          // Check if message already exists (prevent duplicates)
          const exists = prev.some(m => m.messageId === msg.messageId);
          if (exists) return prev;
          return [...prev, formattedMsg];
        });
        
        // Auto-mark message as read if chat is open and message is from selected user
        if (msg.from === selectedUser?._id && msg.from !== userId) {
          setTimeout(() => {
            socket.emit('message_read', {
              messageId: msg.messageId,
              from: msg.from
            });
          }, 1000); // 1 second delay to simulate reading time
        }
      }
    });

    // Listen for message status updates
    socket.on("message_status", (statusUpdate) => {
      const { messageId, status } = statusUpdate;
      
      setMessages((prev) => 
        prev.map((msg) => 
          msg.messageId === messageId 
            ? { ...msg, status }
            : msg
        )
      );
    });

    // Listen for user status changes (online/offline)
    socket.on("user_status_change", (data) => {
      const { userId: changedUserId, status } = data;
      setUserStatuses((prev) => ({
        ...prev,
        [changedUserId]: status
      }));
    });

    // Listen for typing indicators
    socket.on("user_typing", (data) => {
      const { userId: typingUserId, typing } = data;
      setTypingUsers((prev) => ({
        ...prev,
        [typingUserId]: typing
      }));

      // Clear typing indicator after 3 seconds
      if (typing) {
        setTimeout(() => {
          setTypingUsers((prev) => ({
            ...prev,
            [typingUserId]: false
          }));
        }, 3000);
      }
    });

    // Handle message errors
    socket.on("message_error", (error) => {
      console.error("Message error:", error);
      // You can show a toast notification here
    });

    return () => {
      socket.disconnect();
      socket.off("receive_message");
      socket.off("message_status");
      socket.off("user_status_change");
      socket.off("user_typing");
      socket.off("message_error");
    };
  }, [token, selectedUser, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Generate unique message ID
  const generateMessageId = () => {
    return `msg_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/auth/users");
      setUsers(res.data.filter((u: User) => u._id !== userId));
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

const fetchMessages = async () => {
  if (!selectedUser || !userId || !token) return;
  
  try {
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const res = await api.get(`/messages/${userId}/${selectedUser._id}`, config);
    const mappedMessages = res.data.map((msg: Message & { meta_msg_id: string; sender: User; receiver: User; status?: string; timestamp: number }) => ({
      messageId: msg.meta_msg_id,
      from: msg.sender._id,
      to: msg.receiver._id,
      content: msg.content,
      timestamp: msg.timestamp,
      status: msg.status || 'delivered'
    }));
    setMessages(mappedMessages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    if (
      typeof err === "object" &&
      err !== null &&
      "response" in err &&
      typeof (err as { response?: unknown }).response === "object" &&
      (err as { response?: { status?: number } }).response?.status === 401
    ) {
      // Token expired - redirect to login
      window.location.href = '/login';
    }
  }
};


  useEffect(() => {
    fetchUsers();
    if (selectedUser) {
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [selectedUser]);

  const sendMessage = () => {
    if (!selectedUser || !userId || !message.trim()) return;

    const messageId = generateMessageId();
    
    const newMsg: ExtendedMessage = {
      messageId,
      from: userId,
      to: selectedUser._id,
      content: message.trim(),
      timestamp: Date.now(),
      status: 'sent'
    };

    // Add message to UI immediately (optimistic update)
    setMessages((prev) => [...prev, newMsg]);

    // Send to server
    socket.emit("send_message", {
      to: selectedUser._id,
      content: message.trim(),
      messageId
    });

    setMessage("");

    // Stop typing indicator
    socket.emit("typing_stop", { to: selectedUser._id });
  };

  // Handle typing indicators
  const handleTyping = (value: string) => {
    setMessage(value);

    if (!selectedUser) return;

    if (value.trim()) {
      // Start typing
      socket.emit("typing_start", { to: selectedUser._id });
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing after 2 seconds of no typing
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing_stop", { to: selectedUser._id });
      }, 2000);
    } else {
      // Stop typing if message is empty
      socket.emit("typing_stop", { to: selectedUser._id });
    }
  };

  // Status indicator component
  const MessageStatus = ({ status, timestamp }: { status?: string; timestamp: string | number }) => {
    const formatTime = (timestamp: string | number) => {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    };

    const getStatusIcon = () => {
      switch (status) {
        case 'sent':
          return <Check className="w-4 h-4 text-[#8696a0]" />;
        case 'delivered':
          return <CheckCheck className="w-4 h-4 text-[#8696a0]" />;
        case 'read':
          return <CheckCheck className="w-4 h-4 text-[#53bdeb]" />;
        default:
          return <Check className="w-4 h-4 text-[#8696a0]" />;
      }
    };

    return (
      <div className="flex items-center justify-end gap-1 mt-1">
        <span className="text-[#8696a0] text-xs">
          {formatTime(timestamp)}
        </span>
        {getStatusIcon()}
      </div>
    );
  };

  const getUserStatus = (userId: string) => {
    return userStatuses[userId] || 'offline';
  };

  const isUserTyping = (userId: string) => {
    return typingUsers[userId] || false;
  };

  return (
    <div className="flex h-screen bg-[#111b21]">
      {/* Sidebar */}
      <div className="w-[30%] bg-[#111b21] border-r border-[#2a3942] flex flex-col">
        {/* Sidebar Header */}
        <div className="bg-[#202c33] p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#00a884] rounded-full flex items-center justify-center text-white font-semibold">
              {username?.[0]?.toUpperCase()}
            </div>
            <span className="text-[#e9edef] text-lg font-medium">{username}</span>
          </div>
          <div className="flex items-center gap-4">
            <MoreVertical className="w-5 h-5 text-[#8696a0] cursor-pointer hover:text-[#e9edef]" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-[#111b21]">
          <div className="bg-[#202c33] rounded-lg flex items-center px-4 py-2">
            <Search className="w-4 h-4 text-[#8696a0] mr-3" />
            <input 
              type="text" 
              placeholder="Search or start new chat"
              className="bg-transparent text-[#e9edef] text-sm flex-1 outline-none placeholder-[#8696a0]"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {users
          .filter(user => user._id !== userId)
          .map((user) => (
            <div
              key={user._id}
              className={`flex items-center p-3 cursor-pointer transition-all hover:bg-[#2a3942] ${
                selectedUser?._id === user._id ? "bg-[#2a3942]" : ""
              }`}
              onClick={() => setSelectedUser(user)}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-[#6b7c85] rounded-full flex items-center justify-center text-white font-semibold mr-3">
                  {user.username[0]?.toUpperCase()}
                </div>
                {/* Online status indicator */}
                {getUserStatus(user._id) === 'online' && (
                  <div className="absolute bottom-0 right-3 w-3 h-3 bg-[#00a884] rounded-full border-2 border-[#111b21]"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-[#e9edef] font-medium text-base truncate">
                    {user.username}
                  </h3>
                  <span className="text-[#8696a0] text-xs">
                    {/* You can add last message time here */}
                  </span>
                </div>
                <p className="text-[#8696a0] text-sm truncate">
                  {isUserTyping(user._id) ? (
                    <span className="text-[#00a884]">typing...</span>
                  ) : getUserStatus(user._id) === 'online' ? (
                    'online'
                  ) : (
                    'Click to start chatting'
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-[#0b141a]">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="bg-[#202c33] p-3 flex items-center justify-between border-b border-[#2a3942]">
              <div className="flex items-center gap-3">
                <ArrowLeft className="w-5 h-5 text-[#8696a0] cursor-pointer md:hidden" />
                <div className="relative">
                  <div className="w-10 h-10 bg-[#6b7c85] rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedUser.username[0]?.toUpperCase()}
                  </div>
                  {getUserStatus(selectedUser._id) === 'online' && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] rounded-full border-2 border-[#202c33]"></div>
                  )}
                </div>
                <div>
                  <h2 className="text-[#e9edef] font-medium text-lg">
                    {selectedUser.username}
                  </h2>
                  <p className="text-[#8696a0] text-xs">
                    {isUserTyping(selectedUser._id) ? (
                      <span className="text-[#00a884]">typing...</span>
                    ) : getUserStatus(selectedUser._id) === 'online' ? (
                      'online'
                    ) : (
                      'offline'
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Video className="w-5 h-5 text-[#8696a0] cursor-pointer hover:text-[#e9edef]" />
                <Phone className="w-5 h-5 text-[#8696a0] cursor-pointer hover:text-[#e9edef]" />
                <MoreVertical className="w-5 h-5 text-[#8696a0] cursor-pointer hover:text-[#e9edef]" />
              </div>
            </div>

            {/* Messages Container */}
            <div 
              className="flex-1 overflow-y-auto px-4 py-2 space-y-1 bg-[#0b141a]"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
                backgroundSize: '20px 20px',
              }}
            >
              {messages.map((msg, i) => {
                const isSentByMe = msg.from === userId;
                return (
                  <div
                    key={i}
                    className={`flex ${isSentByMe ? "justify-end" : "justify-start"} mb-2`}
                  >
                    <div
                      className={`max-w-[65%] rounded-lg px-3 py-2 shadow-sm ${
                        isSentByMe
                          ? "bg-[#005c4b] text-[#e9edef] rounded-br-sm"
                          : "bg-[#202c33] text-[#e9edef] rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm leading-5 break-words">
                        {msg.content}
                      </p>
                      {isSentByMe ? (
                        <MessageStatus 
                          status={msg.status} 
                          timestamp={msg.timestamp} 
                        />
                      ) : (
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[#8696a0] text-xs">
                            {new Date(msg.timestamp).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: false 
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Box */}
            <div className="bg-[#202c33] p-3 flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Smile className="w-6 h-6 text-[#8696a0] cursor-pointer hover:text-[#e9edef]" />
                <Paperclip className="w-6 h-6 text-[#8696a0] cursor-pointer hover:text-[#e9edef]" />
              </div>
              
              <div className="flex-1 bg-[#2a3942] rounded-lg flex items-center px-3 py-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => handleTyping(e.target.value)}
                  placeholder="Type a message"
                  className="flex-1 bg-transparent text-[#e9edef] text-sm outline-none placeholder-[#8696a0]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
              </div>
              
              <button
                onClick={sendMessage}
                disabled={!message.trim()}
                className="w-10 h-10 bg-[#00a884] rounded-full flex items-center justify-center hover:bg-[#00a884]/80 disabled:bg-[#8696a0] disabled:cursor-not-allowed transition-colors"
              >
                {message.trim() ? (
                  <Send className="w-5 h-5 text-white" />
                ) : (
                  <Mic className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex flex-col items-center justify-center bg-[#0b141a] text-center">
            <div className="w-80 h-80 bg-[#202c33] rounded-full flex items-center justify-center mb-8">
              <div className="text-8xl text-[#8696a0]">💬</div>
            </div>
            <h1 className="text-3xl font-light text-[#e9edef] mb-4">
              WhatsApp Web
            </h1>
            <p className="text-[#8696a0] text-sm max-w-md leading-relaxed">
              Send and receive messages without keeping your phone online.<br />
              Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
