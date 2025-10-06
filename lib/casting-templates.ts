export interface CastingTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template: {
    title: string;
    description: string;
    requirements: string;
    projectType: string;
    shootingDuration: string;
    compensation: string;
    location: string;
    company: string;
    contactInfo: string;
  };
  tags: string[];
  icon: string;
}

export const castingTemplates: CastingTemplate[] = [
  {
    id: 'tv-series-lead',
    name: 'TV Series Lead Role',
    description: 'Template for casting lead roles in television series',
    category: 'Television',
    template: {
      title: 'Lead Actor - [Series Name]',
      description: 'We are seeking a talented lead actor for our upcoming television series. The role requires strong dramatic skills, emotional range, and the ability to carry a series.\n\nCharacter: [Character Name]\nAge Range: [Age Range]\nGender: [Gender]\n\nThis is a recurring role throughout the season with potential for multiple seasons.',
      requirements: '• Professional acting experience (minimum 3 years)\n• Strong dramatic and comedic range\n• Ability to work long hours on set\n• Previous television experience preferred\n• Must be available for full shooting schedule\n• Professional attitude and collaborative spirit',
      projectType: 'TV Series',
      shootingDuration: '6-8 months',
      compensation: 'Competitive rate based on experience',
      location: 'Riyadh, Saudi Arabia',
      company: '[Production Company]',
      contactInfo: 'Please submit your application with headshot, resume, and demo reel.',
    },
    tags: ['lead', 'drama', 'television', 'recurring'],
    icon: '📺',
  },
  {
    id: 'commercial-spokesperson',
    name: 'Commercial Spokesperson',
    description: 'Template for commercial and advertising roles',
    category: 'Commercial',
    template: {
      title: 'Commercial Spokesperson - [Brand/Product]',
      description: 'Looking for a charismatic spokesperson for our upcoming commercial campaign. The ideal candidate should be relatable, engaging, and able to connect with our target audience.\n\nThis is a high-profile campaign with potential for ongoing partnership.',
      requirements: '• Natural on-camera presence\n• Clear speaking voice\n• Professional appearance\n• Previous commercial experience preferred\n• Ability to take direction well\n• Reliable and punctual',
      projectType: 'Commercial',
      shootingDuration: '1-3 days',
      compensation: 'Industry standard rates',
      location: 'Dubai, UAE',
      company: '[Advertising Agency]',
      contactInfo: 'Submit portfolio with previous commercial work.',
    },
    tags: ['commercial', 'spokesperson', 'brand', 'short-term'],
    icon: '📢',
  },
  {
    id: 'film-supporting',
    name: 'Film Supporting Role',
    description: 'Template for supporting roles in feature films',
    category: 'Film',
    template: {
      title: 'Supporting Actor - [Film Title]',
      description: 'Seeking a skilled supporting actor for our feature film production. This role is integral to the story and requires strong character development skills.\n\nCharacter: [Character Name]\nRole Type: Supporting\nScreen Time: [Estimated Screen Time]',
      requirements: '• Professional acting training\n• Film experience preferred\n• Strong character development skills\n• Ability to work with ensemble cast\n• Commitment to full production schedule\n• Professional work ethic',
      projectType: 'Film',
      shootingDuration: '4-6 weeks',
      compensation: 'SAG rates or equivalent',
      location: 'Jeddah, Saudi Arabia',
      company: '[Film Production Company]',
      contactInfo: 'Please include film credits and references.',
    },
    tags: ['film', 'supporting', 'feature', 'character'],
    icon: '🎬',
  },
  {
    id: 'voice-acting',
    name: 'Voice Acting Role',
    description: 'Template for voice acting and dubbing projects',
    category: 'Voice Acting',
    template: {
      title: 'Voice Actor - [Project Name]',
      description: 'We need a talented voice actor for our [animation/documentary/dubbing] project. The role requires excellent vocal skills and character interpretation.\n\nCharacter: [Character Name]\nLanguage: [Language]\nStyle: [Animation/Live Action/Documentary]',
      requirements: '• Professional voice acting experience\n• Clear diction and pronunciation\n• Ability to create distinct character voices\n• Experience with [specific project type]\n• Available for recording sessions\n• Home studio setup preferred',
      projectType: 'Voice Acting',
      shootingDuration: '2-4 weeks',
      compensation: 'Per session or project rate',
      location: 'Remote/Studio',
      company: '[Voice Production Company]',
      contactInfo: 'Submit voice demo reel and previous work samples.',
    },
    tags: ['voice', 'animation', 'dubbing', 'remote'],
    icon: '🎤',
  },
  {
    id: 'theater-production',
    name: 'Theater Production',
    description: 'Template for live theater and stage productions',
    category: 'Theater',
    template: {
      title: 'Stage Actor - [Play Title]',
      description: 'Looking for talented stage actors for our upcoming theater production. This is a live performance requiring strong stage presence and vocal projection.\n\nPlay: [Play Title]\nTheater: [Theater Name]\nRun: [Performance Dates]',
      requirements: '• Professional theater experience\n• Strong stage presence\n• Excellent vocal projection\n• Ability to memorize extensive dialogue\n• Commitment to full rehearsal and performance schedule\n• Previous Shakespeare or classical theater experience preferred',
      projectType: 'Theater',
      shootingDuration: '2-3 months (including rehearsals)',
      compensation: 'Theater rates with performance bonuses',
      location: '[City], Saudi Arabia',
      company: '[Theater Company]',
      contactInfo: 'Audition required. Please prepare [specific monologue/scene].',
    },
    tags: ['theater', 'stage', 'live', 'classical'],
    icon: '🎭',
  },
  {
    id: 'short-film',
    name: 'Short Film Role',
    description: 'Template for independent short film projects',
    category: 'Film',
    template: {
      title: 'Actor - [Short Film Title]',
      description: 'Independent short film seeking passionate actors. This is a creative project with potential for festival exposure.\n\nGenre: [Drama/Comedy/Thriller/etc.]\nLength: [Film Duration]\nFestival: [Target Festivals]',
      requirements: '• Passion for independent film\n• Flexible schedule\n• Collaborative spirit\n• Previous short film experience preferred\n• Willing to work with emerging filmmakers\n• Portfolio of previous work',
      projectType: 'Film',
      shootingDuration: '1-2 weeks',
      compensation: 'Deferred payment + festival exposure',
      location: '[Location]',
      company: '[Independent Production]',
      contactInfo: 'Submit resume and links to previous work.',
    },
    tags: ['short', 'independent', 'festival', 'emerging'],
    icon: '🎥',
  },
  {
    id: 'modeling-campaign',
    name: 'Modeling Campaign',
    description: 'Template for fashion and lifestyle modeling',
    category: 'Modeling',
    template: {
      title: 'Model - [Campaign/Brand]',
      description: 'Seeking professional models for our upcoming campaign. We need someone who can bring our brand vision to life.\n\nCampaign Type: [Fashion/Lifestyle/Commercial]\nBrand: [Brand Name]\nStyle: [Specific Style Requirements]',
      requirements: '• Professional modeling experience\n• Portfolio of previous work\n• Specific measurements: [Height/Size Requirements]\n• Professional attitude\n• Reliable and punctual\n• Experience with [specific type of modeling]',
      projectType: 'Modeling',
      shootingDuration: '1-5 days',
      compensation: 'Model rates + usage rights',
      location: '[Studio/Location]',
      company: '[Modeling Agency/Brand]',
      contactInfo: 'Submit portfolio and measurements.',
    },
    tags: ['modeling', 'fashion', 'lifestyle', 'campaign'],
    icon: '👗',
  },
  {
    id: 'event-host',
    name: 'Event Host/Presenter',
    description: 'Template for event hosting and presentation roles',
    category: 'Events',
    template: {
      title: 'Event Host - [Event Name]',
      description: 'Looking for a charismatic host for our upcoming event. The ideal candidate should be engaging, professional, and able to interact with diverse audiences.\n\nEvent Type: [Corporate/Entertainment/Cultural]\nAudience: [Expected Audience]\nDuration: [Event Duration]',
      requirements: '• Excellent public speaking skills\n• Professional presentation\n• Ability to engage audiences\n• Experience hosting similar events\n• Flexible and adaptable\n• Strong interpersonal skills',
      projectType: 'Events',
      shootingDuration: '1 day',
      compensation: 'Event hosting rates',
      location: '[Venue/Location]',
      company: '[Event Company]',
      contactInfo: 'Submit video reel of previous hosting experience.',
    },
    tags: ['host', 'presenter', 'events', 'public-speaking'],
    icon: '🎤',
  },
];

export const getTemplateById = (id: string): CastingTemplate | undefined => {
  return castingTemplates.find(template => template.id === id);
};

export const getTemplatesByCategory = (category: string): CastingTemplate[] => {
  return castingTemplates.filter(template => template.category === category);
};

export const getAllCategories = (): string[] => {
  return Array.from(new Set(castingTemplates.map(template => template.category)));
};
