'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  Search, 
  Send,
  Paperclip,
  MoreVertical,
  CheckCheck,
  Check
} from 'lucide-react';

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(1);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with real API
  const conversations = [
    {
      id: 1,
      name: 'MBC Studios',
      avatar: 'M',
      lastMessage: 'We would like to schedule an interview for the lead role.',
      timestamp: '10 min ago',
      unread: 2,
      online: true,
    },
    {
      id: 2,
      name: 'Telfaz11',
      avatar: 'T',
      lastMessage: 'Thank you for your application. We will review it shortly.',
      timestamp: '2 hours ago',
      unread: 0,
      online: false,
    },
    {
      id: 3,
      name: 'Manga Productions',
      avatar: 'M',
      lastMessage: 'Could you send us your voice samples?',
      timestamp: '1 day ago',
      unread: 1,
      online: true,
    },
    {
      id: 4,
      name: 'Creative Hub Agency',
      avatar: 'C',
      lastMessage: 'Great! Looking forward to working with you.',
      timestamp: '3 days ago',
      unread: 0,
      online: false,
    },
  ];

  const messages = [
    {
      id: 1,
      senderId: 'mbc',
      senderName: 'MBC Studios',
      text: 'Hello! We received your application for the historical drama series.',
      timestamp: '2:30 PM',
      isOwn: false,
      read: true,
    },
    {
      id: 2,
      senderId: 'me',
      senderName: 'Me',
      text: 'Thank you! I am very excited about this opportunity.',
      timestamp: '2:35 PM',
      isOwn: true,
      read: true,
    },
    {
      id: 3,
      senderId: 'mbc',
      senderName: 'MBC Studios',
      text: 'We were impressed with your portfolio and experience. We would like to schedule an interview for the lead role.',
      timestamp: '2:45 PM',
      isOwn: false,
      read: true,
    },
    {
      id: 4,
      senderId: 'mbc',
      senderName: 'MBC Studios',
      text: 'Are you available next week for a video call?',
      timestamp: '2:46 PM',
      isOwn: false,
      read: false,
    },
  ];

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    // TODO: Send message via API
    console.log('Sending:', messageText);
    setMessageText('');
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <div className="h-screen bg-background flex overflow-hidden">
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
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors border-b ${
                  selectedConversation === conversation.id ? 'bg-muted' : ''
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white font-bold">
                    {conversation.avatar}
                  </div>
                  {conversation.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-foreground truncate">
                      {conversation.name}
                    </h3>
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                      {conversation.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unread > 0 && (
                      <span className="ml-2 flex-shrink-0 w-5 h-5 bg-primary rounded-full text-xs text-white flex items-center justify-center">
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="h-16 border-b px-6 flex items-center justify-between bg-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white font-bold">
                M
              </div>
              <div>
                <h2 className="font-semibold text-foreground">MBC Studios</h2>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/20">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-md px-4 py-2 rounded-2xl ${
                    message.isOwn
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-card text-foreground rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="text-sm break-words">{message.text}</p>
                  <div className={`flex items-center gap-1 mt-1 ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span className={`text-xs ${message.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {message.timestamp}
                    </span>
                    {message.isOwn && (
                      message.read ? (
                        <CheckCheck className="w-3 h-3 text-primary-foreground/70" />
                      ) : (
                        <Check className="w-3 h-3 text-primary-foreground/70" />
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="border-t p-4 bg-card">
            <div className="flex items-end gap-2">
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <Paperclip className="w-5 h-5" />
              </Button>
              <div className="flex-1 relative">
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="pr-10"
                />
              </div>
              <Button onClick={handleSendMessage} size="icon" className="flex-shrink-0">
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

