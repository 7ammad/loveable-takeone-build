'use client';

import { Card } from '@/components/ui/card';
import { User, Briefcase } from 'lucide-react';

interface RoleSelectorProps {
  selectedRole: 'talent' | 'caster' | null;
  onSelectRole: (role: 'talent' | 'caster') => void;
}

export default function RoleSelector({ selectedRole, onSelectRole }: RoleSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-foreground">I want to...</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Talent Option */}
        <Card
          className={`cursor-pointer p-6 text-center transition-all hover:shadow-lg ${
            selectedRole === 'talent'
              ? 'border-primary ring-2 ring-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
          onClick={() => onSelectRole('talent')}
        >
          <div className="flex flex-col items-center gap-3">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              selectedRole === 'talent' ? 'bg-primary' : 'bg-primary/10'
            }`}>
              <User className={`w-8 h-8 ${
                selectedRole === 'talent' ? 'text-primary-foreground' : 'text-primary'
              }`} />
            </div>
            <div>
              <h4 className="font-semibold text-lg text-foreground">Find Work</h4>
              <p className="text-sm text-muted-foreground">As a Talent</p>
            </div>
          </div>
        </Card>

        {/* Caster Option */}
        <Card
          className={`cursor-pointer p-6 text-center transition-all hover:shadow-lg ${
            selectedRole === 'caster'
              ? 'border-primary ring-2 ring-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
          onClick={() => onSelectRole('caster')}
        >
          <div className="flex flex-col items-center gap-3">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              selectedRole === 'caster' ? 'bg-primary' : 'bg-primary/10'
            }`}>
              <Briefcase className={`w-8 h-8 ${
                selectedRole === 'caster' ? 'text-primary-foreground' : 'text-primary'
              }`} />
            </div>
            <div>
              <h4 className="font-semibold text-lg text-foreground">Hire Talent</h4>
              <p className="text-sm text-muted-foreground">As a Hirer</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

