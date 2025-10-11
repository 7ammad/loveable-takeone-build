'use client';

import { useState, useEffect, useRef } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardNav } from '@/components/DashboardNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api/client';
import { 
  Search, 
  Send,
  MoreVertical,
  CheckCheck,
  Check,
  Inbox
} from 'lucide-react';
import Image from 'next/image';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  id: string;
  otherUser: {
    id: string;
    name: string;
    avatar: string | null;
    role: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
  } | null;
  unreadCount: number;
  lastMessageAt: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  readAt: string | null;
  createdAt: string;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  useEffect(() => {
    async function fetchConversations() {
      try {
        const response = await apiClient.get<{ success: boolean; data: Conversation[] }>('/api/v1/conversations');
        const data = response.data;
        if (data.success && data.data) {
          setConversations(data.data);
          if (data.data.length > 0 && !selectedConversation) {
            setSelectedConversation(data.data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchConversations();
  }, [selectedConversation]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (!selectedConversation) return;

    async function fetchMessages() {
      try {
        const response = await apiClient.get<{ success: boolean; data: Message[] }>(`/api/v1/conversations/${selectedConversation}/messages`);
        const data = response.data;
        if (data.success && data.data) {
          setMessages(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    }

    fetchMessages();
  }, [selectedConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || isSending) return;

    setIsSending(true);
    try {
      const response = await apiClient.post<{ success: boolean; data: Message }>(`/api/v1/conversations/${selectedConversation}/messages`, {
        content: messageText.trim(),
      });

      const data = response.data;
      if (data.success && data.data) {
        setMessages((prev) => [...prev, data.data]);
        setMessageText('');
        
        // Update conversation's last message
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversation
              ? {
                  ...conv,
                  lastMessage: {
                    content: messageText.trim(),
                    createdAt: new Date().toISOString(),
                  },
                  lastMessageAt: new Date().toISOString(),
                }
              : conv
          )
        );
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConvData = conversations.find((c) => c.id === selectedConversation);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ProtectedRoute>
      <DashboardNav />
      <div className="h-screen bg-background flex overflow-hidden pt-16">
        {/* Conversations List */}
        <div className="w-full md:w-80 lg:w-96 border-r flex flex-col bg-card">
          {/* Header */}
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold text-foreground mb-4">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">Loading...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={<Inbox className="w-8 h-8" />}
                  title="No conversations yet"
                  description="Start a conversation by contacting talent or casters"
                />
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors border-b ${
                    selectedConversation === conversation.id ? 'bg-muted' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white font-bold overflow-hidden">
                      {conversation.otherUser.avatar ? (
                        <Image
                          src={conversation.otherUser.avatar}
                          alt={conversation.otherUser.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      ) : (
                        getInitials(conversation.otherUser.name)
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {conversation.otherUser.name}
                      </h3>
                      <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                        {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage?.content || 'No messages yet'}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="ml-2 flex-shrink-0 w-5 h-5 bg-primary rounded-full text-xs text-white flex items-center justify-center">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {!selectedConvData ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={<Inbox className="w-12 h-12" />}
                title="No conversation selected"
                description="Select a conversation from the list to start messaging"
              />
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="h-16 border-b px-6 flex items-center justify-between bg-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white font-bold">
                    {selectedConvData.otherUser.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedConvData.otherUser.avatar}
                        alt={selectedConvData.otherUser.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getInitials(selectedConvData.otherUser.name)
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">{selectedConvData.otherUser.name}</h2>
                    <p className="text-xs text-muted-foreground capitalize">{selectedConvData.otherUser.role}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/20">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwn = message.senderId !== selectedConvData.otherUser.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-md px-4 py-2 rounded-2xl ${
                            isOwn
                              ? 'bg-primary text-primary-foreground rounded-br-none'
                              : 'bg-card text-foreground rounded-bl-none shadow-sm'
                          }`}
                        >
                          <p className="text-sm break-words">{message.content}</p>
                          <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <span className={`text-xs ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                              {new Date(message.createdAt).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </span>
                            {isOwn && (
                              message.readAt ? (
                                <CheckCheck className="w-3 h-3 text-primary-foreground/70" />
                              ) : (
                                <Check className="w-3 h-3 text-primary-foreground/70" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t p-4 bg-card">
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      placeholder="Type a message..."
                      disabled={isSending}
                      className="pr-10"
                    />
                  </div>
                  <Button 
                    onClick={handleSendMessage} 
                    size="icon" 
                    className="flex-shrink-0"
                    disabled={isSending || !messageText.trim()}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

