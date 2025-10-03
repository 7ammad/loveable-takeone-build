'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, X, ArrowLeft, ArrowRight } from 'lucide-react';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  castingCallTitle: string;
  castingCallId: string;
}

export default function ApplicationModal({
  isOpen,
  onClose,
  castingCallTitle,
  castingCallId,
}: ApplicationModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    coverLetter: '',
    availability: '',
    additionalNotes: '',
    agreeToTerms: false,
  });

  if (!isOpen) return null;

  const handleSubmit = async () => {
    // TODO: Submit application via API
    console.log('Submitting application:', { castingCallId, ...formData });
    // Close modal and show success
    onClose();
  };

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-card rounded-xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Apply for Role</h2>
            <p className="text-sm text-muted-foreground mt-1">{castingCallTitle}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step >= stepNum ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {step > stepNum ? <CheckCircle2 className="w-5 h-5" /> : stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > stepNum ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-muted-foreground">Profile</span>
            <span className="text-xs text-muted-foreground">Details</span>
            <span className="text-xs text-muted-foreground">Review</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Profile Check */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">Your Profile Looks Great!</h3>
                </div>
                <p className="text-sm text-green-700">
                  Your profile is complete and ready for submission.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Profile Summary</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground mb-1">Experience</p>
                    <p className="font-medium text-foreground">5 years</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground mb-1">Skills</p>
                    <p className="font-medium text-foreground">Acting, Voice Acting</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground mb-1">Location</p>
                    <p className="font-medium text-foreground">Riyadh</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground mb-1">Verification</p>
                    <p className="font-medium text-green-600">✓ Nafath Verified</p>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                Edit Profile
              </Button>
            </div>
          )}

          {/* Step 2: Application Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Cover Letter *
                </label>
                <textarea
                  className="w-full min-h-[150px] p-3 rounded-md border border-input bg-background text-foreground resize-y"
                  placeholder="Tell us why you're a great fit for this role..."
                  value={formData.coverLetter}
                  onChange={(e) => updateFormData('coverLetter', e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.coverLetter.length}/500 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Availability *
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Available immediately, Available from Nov 2025"
                  value={formData.availability}
                  onChange={(e) => updateFormData('availability', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Additional Notes
                </label>
                <textarea
                  className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-foreground resize-y"
                  placeholder="Any additional information you'd like to share..."
                  value={formData.additionalNotes}
                  onChange={(e) => updateFormData('additionalNotes', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Applying for</p>
                  <p className="font-medium text-foreground">{castingCallTitle}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Cover Letter</p>
                  <p className="text-sm text-foreground">{formData.coverLetter}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Availability</p>
                  <p className="text-sm text-foreground">{formData.availability}</p>
                </div>
                {formData.additionalNotes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Additional Notes</p>
                    <p className="text-sm text-foreground">{formData.additionalNotes}</p>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.agreeToTerms}
                  onChange={(e) => updateFormData('agreeToTerms', e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-sm text-foreground">
                  I agree to the application terms and confirm that all information provided is accurate. I understand that false information may result in disqualification.
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!formData.agreeToTerms || !formData.coverLetter || !formData.availability}
            >
              Submit Application
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

