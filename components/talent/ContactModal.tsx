'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Send } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  talentName: string;
  talentId: string;
}

export default function ContactModal({ isOpen, onClose, talentName, talentId }: ContactModalProps) {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  });
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      // TODO: Send message via API
      console.log('Sending message to:', talentId, formData);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Close modal on success
      onClose();
      setFormData({ subject: '', message: '' });
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-card rounded-xl shadow-xl">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Contact {talentName}</h2>
            <p className="text-sm text-muted-foreground mt-1">Send a message to this talent</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Subject *
            </label>
            <Input
              value={formData.subject}
              onChange={(e) => updateFormData('subject', e.target.value)}
              placeholder="e.g., Interested in collaboration"
              required
              disabled={isSending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Message *
            </label>
            <textarea
              className="w-full min-h-[150px] p-3 rounded-md border border-input bg-background text-foreground resize-y"
              value={formData.message}
              onChange={(e) => updateFormData('message', e.target.value)}
              placeholder="Write your message here..."
              required
              disabled={isSending}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.message.length}/1000 characters
            </p>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> This message will be sent through TakeOne&apos;s secure messaging system. 
              The talent will be able to respond directly to you.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isSending}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSending || !formData.subject || !formData.message}>
              <Send className="w-4 h-4 mr-2" />
              {isSending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

