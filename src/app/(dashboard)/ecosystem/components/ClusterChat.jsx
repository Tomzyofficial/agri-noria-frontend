"use client";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { FaPaperPlane, FaUserCircle, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";

export default function ClusterChat({ clusterId }) {
   const [messages, setMessages] = useState([]);
   const [newMessage, setNewMessage] = useState("");
   const [socket, setSocket] = useState(null);
   const [loading, setLoading] = useState(true);
   const [isSending, setIsSending] = useState(false);
   const [currentUser, setCurrentUser] = useState(null);
   const messagesEndRef = useRef(null);

   useEffect(() => {
      if (!clusterId) return;

      const initChat = async () => {
         try {
            // Fetch current user
            const userRes = await fetch("/api/proxy/auth/verify-vendor");
            if (userRes.ok) {
               const u = await userRes.json();
               if (u.authenticated) setCurrentUser({ ...u, id: u.userId });
            }

            // Fetch initial chat history
            const res = await fetch(`/api/proxy/pipeline/clusters/${clusterId}/chats`);
            if (res.ok) {
               const json = await res.json();
               if (json.success) setMessages(json.data || []);
            }
         } catch (err) {
            console.error("Failed to init chat:", err);
         } finally {
            setLoading(false);
            scrollToBottom();
         }
      };

      initChat();

      // Setup Socket.io connection
      const socketInstance = io(process.env.NEXT_PUBLIC_BACKEND_URL || "https://agri-noria-backend.onrender.com");
      setSocket(socketInstance);

      socketInstance.on("connect", () => {
         socketInstance.emit("join_cluster", clusterId);
      });

      socketInstance.on("new_message", (message) => {
         setMessages((prev) => [...prev, message]);
         scrollToBottom();
      });

      return () => {
         socketInstance.emit("leave_cluster", clusterId);
         socketInstance.disconnect();
      };
   }, [clusterId]);

   useEffect(() => {
      scrollToBottom();
   }, [messages]);

   const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
   };

   const handleSendMessage = async (e) => {
      e.preventDefault();
      if (!newMessage.trim() || !clusterId || !currentUser) return;

      setIsSending(true);
      try {
         const res = await fetch(`/api/proxy/pipeline/clusters/${clusterId}/chats`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: newMessage.trim() }),
         });

         if (res.ok) {
            setNewMessage("");
            // The message will be broadcasted back via socket, so we don't need to manually append it here unless we want optimistic UI updates.
         } else {
            toast.error("Failed to send message");
         }
      } catch (err) {
         console.error("Error sending message:", err);
         toast.error("Network error while sending message");
      } finally {
         setIsSending(false);
      }
   };

   if (!clusterId) return null;

   return (
      <div className="flex flex-col h-[500px] bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
         {/* Header */}
         <div className="bg-teal-600 text-white p-4 shadow-md z-10 flex items-center justify-between">
            <h3 className="font-bold text-lg">Cluster Group Chat</h3>
            <span className="text-xs font-medium px-2 py-1 bg-white/20 rounded-full">{messages.length} messages</span>
         </div>

         {/* Chat Area */}
         <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
            {loading ? (
               <div className="h-full flex items-center justify-center">
                  <FaSpinner className="animate-spin text-teal-500 text-2xl" />
               </div>
            ) : messages.length === 0 ? (
               <div className="h-full flex items-center justify-center text-gray-400 font-medium text-sm">
                  No messages yet. Be the first to say hello!
               </div>
            ) : (
               messages.map((msg, idx) => {
                  const isMe = msg.sender_id === currentUser.id;
                  return (
                     <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"} mb-4`}>
                        {!isMe && (
                           <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 flex items-center justify-center mr-2 flex-shrink-0">
                              <FaUserCircle size={20} />
                           </div>
                        )}
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${isMe ? "bg-teal-500 text-white rounded-br-none" : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-none"}`}>
                           <p className={`text-[10px] font-bold mb-1 ${isMe ? "text-teal-100" : "text-teal-600 dark:text-teal-400"}`}>
                              {isMe ? "You" : `${msg.sender_fname} ${msg.sender_lname}`} • {msg.sender_role}
                           </p>
                           <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                           <p className={`text-[9px] mt-1 text-right ${isMe ? "text-teal-100" : "text-gray-400"}`}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </p>
                        </div>
                     </div>
                  );
               })
            )}
            <div ref={messagesEndRef} />
         </div>

         {/* Input Area */}
         <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
               <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  disabled={isSending}
               />
               <button
                  type="submit"
                  disabled={isSending || !newMessage.trim()}
                  className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors shadow-md"
               >
                  {isSending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
               </button>
            </form>
         </div>
      </div>
   );
}
