'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { TalentProfile } from '@/lib/types';
import { useAuth } from '@/lib/contexts/auth-context';

interface ProfileResponse {
  success: boolean;
  data: TalentProfile | null;
}

interface MediaAsset {
  id: string;
  filename: string;
  mimetype: string;
  url: string;
}

export default function TalentProfileView() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<TalentProfile>>({});
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [profileRes, mediaRes] = await Promise.all([
          apiClient.get<ProfileResponse>('/api/v1/profiles/me'),
          apiClient.get<{ success: boolean; data: MediaAsset[] }>('/api/v1/media').catch(() => ({ data: { success: true, data: [] } })),
        ]);
        if (!isMounted) return;
        const fetchedProfile = profileRes.data?.data || null;
        setProfile(fetchedProfile);
        setEditedProfile(fetchedProfile || {});
        setMedia(mediaRes.data?.data || []);
      } catch {
        if (!isMounted) return;
        setProfile(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async () => {
    try {
      const response = await apiClient.post<{ success: boolean }>('/api/v1/profiles/talent', {
        stageName: editedProfile.stageName,
        dateOfBirth: editedProfile.dateOfBirth,
        gender: editedProfile.gender,
        city: editedProfile.city,
        height: editedProfile.height,
        weight: editedProfile.weight,
        eyeColor: editedProfile.eyeColor,
        hairColor: editedProfile.hairColor,
        experience: editedProfile.experience,
        willingToTravel: editedProfile.willingToTravel,
        skills: editedProfile.skills,
        languages: editedProfile.languages,
        instagramUrl: editedProfile.instagramUrl,
        demoReelUrl: editedProfile.demoReelUrl,
        portfolioUrl: editedProfile.portfolioUrl,
      });
      
      if (response.data.success) {
        setProfile(editedProfile as TalentProfile);
        setIsEditing(false);
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile || {});
    setIsEditing(false);
  };

  const updateField = (field: keyof TalentProfile, value: string | number | boolean | string[] | null | undefined) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: '#121212', minHeight: '100vh', color: '#fff' }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  const displayProfile = isEditing ? editedProfile : profile;
  const initials = (displayProfile?.stageName || user?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Portfolio media
  const portfolioMedia = media.filter(m => m.mimetype.startsWith('image/') || m.mimetype.startsWith('video/'));

  return (
    <div style={{ background: '#121212', minHeight: '100vh', paddingBottom: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px' }}>
          {/* Left Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Avatar Card */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 12px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #FFD700' }}>
                {user?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #007FFF, #FFD700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 'bold', color: '#fff' }}>
                    {initials}
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: '4px', right: '4px', width: '24px', height: '24px', background: '#28A745', borderRadius: '50%', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                </div>
              </div>
              
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile.stageName || ''}
                  onChange={(e) => updateField('stageName', e.target.value)}
                  placeholder="Your Name"
                  style={{ fontSize: '18px', fontWeight: 'bold', color: '#121212', marginBottom: '6px', width: '100%', padding: '6px', border: '2px solid #007FFF', borderRadius: '6px', textAlign: 'center' }}
                />
              ) : (
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#121212', marginBottom: '6px' }}>
                  {displayProfile?.stageName || user?.name || 'Your Name'}
                </h2>
              )}
              
              <p style={{ color: '#6C757D', fontSize: '13px', marginBottom: '12px' }}>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.city || ''}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="City"
                    style={{ width: '100%', padding: '6px', border: '1px solid #DEE2E6', borderRadius: '6px', textAlign: 'center', fontSize: '14px' }}
                  />
                ) : (
                  `${displayProfile?.city || 'New York'} • ${displayProfile?.experience || 0} yrs`
                )}
              </p>

              {isEditing ? (
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                  <button onClick={handleSave} style={{ flex: 1, padding: '8px', background: '#FFD700', color: '#121212', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>
                    ✓ Save
                  </button>
                  <button onClick={handleCancel} style={{ flex: 1, padding: '8px', background: '#E9ECEF', color: '#121212', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>
                    ✕ Cancel
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                  <button onClick={() => setIsEditing(true)} style={{ flex: 1, padding: '8px', background: '#121212', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>
                    ⋆ Add to project
                  </button>
                  <button style={{ width: '36px', height: '36px', background: '#F8F9FA', border: '1px solid #DEE2E6', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                    📋
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px', background: '#28A745', borderRadius: '6px', color: '#fff', fontSize: '13px', fontWeight: '500' }}>
                <div style={{ width: '6px', height: '6px', background: '#fff', borderRadius: '50%' }} />
                Available now
              </div>
              <p style={{ color: '#6C757D', fontSize: '11px', marginTop: '6px' }}>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.instagramUrl || ''}
                    onChange={(e) => updateField('instagramUrl', e.target.value)}
                    placeholder="Instagram URL"
                    style={{ width: '100%', padding: '6px', border: '1px solid #DEE2E6', borderRadius: '6px', fontSize: '12px' }}
                  />
                ) : (
                  displayProfile?.instagramUrl || '$25.00/hour'
                )}
              </p>
            </div>

            {/* Skills & Attributes Combined Card */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px' }}>🎭</span>
                <span style={{ fontSize: '11px', color: '#6C757D' }}>Skills & Attributes</span>
              </div>
              
              {/* Skills Section */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', color: '#6C757D', marginBottom: '6px' }}>Skills</div>
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {editedProfile.skills?.map((skill, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#F8F9FA', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' }}>
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newSkills = editedProfile.skills?.filter((_, i) => i !== index) || [];
                              updateField('skills', newSkills);
                            }}
                            style={{ background: 'none', border: 'none', color: '#6C757D', cursor: 'pointer', fontSize: '14px' }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add new skill"
                        style={{ flex: '1', padding: '6px', border: '1px solid #DEE2E6', borderRadius: '4px', fontSize: '12px' }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newSkill.trim()) {
                              const updatedSkills = [...(editedProfile.skills || []), newSkill.trim()];
                              updateField('skills', updatedSkills);
                              setNewSkill('');
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newSkill.trim()) {
                            const updatedSkills = [...(editedProfile.skills || []), newSkill.trim()];
                            updateField('skills', updatedSkills);
                            setNewSkill('');
                          }
                        }}
                        style={{ padding: '6px 12px', background: '#007FFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(displayProfile?.skills || ['Acting', 'Voice Acting', 'Dancing']).map((skill, index) => (
                      <span key={index} style={{ background: '#F8F9FA', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', color: '#121212' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Languages Section */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', color: '#6C757D', marginBottom: '6px' }}>Languages</div>
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {editedProfile.languages?.map((language, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#F8F9FA', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' }}>
                          <span>{language}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newLanguages = editedProfile.languages?.filter((_, i) => i !== index) || [];
                              updateField('languages', newLanguages);
                            }}
                            style={{ background: 'none', border: 'none', color: '#6C757D', cursor: 'pointer', fontSize: '14px' }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="text"
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        placeholder="Add new language"
                        style={{ flex: '1', padding: '6px', border: '1px solid #DEE2E6', borderRadius: '4px', fontSize: '12px' }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newLanguage.trim()) {
                              const updatedLanguages = [...(editedProfile.languages || []), newLanguage.trim()];
                              updateField('languages', updatedLanguages);
                              setNewLanguage('');
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newLanguage.trim()) {
                            const updatedLanguages = [...(editedProfile.languages || []), newLanguage.trim()];
                            updateField('languages', updatedLanguages);
                            setNewLanguage('');
                          }
                        }}
                        style={{ padding: '6px 12px', background: '#007FFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(displayProfile?.languages || ['Arabic', 'English', 'French']).map((language, index) => (
                      <span key={index} style={{ background: '#F8F9FA', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', color: '#121212' }}>
                        {language}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Physical Attributes - 2x2 Grid */}
              <div>
                <div style={{ fontSize: '11px', color: '#6C757D', marginBottom: '8px' }}>Physical Attributes</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {/* Height */}
                  <div>
                    <div style={{ fontSize: '10px', color: '#6C757D', marginBottom: '3px' }}>Height</div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.height || ''}
                        onChange={(e) => updateField('height', parseInt(e.target.value) || null)}
                        placeholder="160 cm"
                        style={{ width: '100%', padding: '6px', border: '1px solid #DEE2E6', borderRadius: '4px', fontSize: '12px' }}
                      />
                    ) : (
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#121212' }}>
                        {displayProfile?.height ? `${displayProfile.height}cm` : "160cm"}
                      </div>
                    )}
                  </div>
                  {/* Weight */}
                  <div>
                    <div style={{ fontSize: '10px', color: '#6C757D', marginBottom: '3px' }}>Weight</div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.weight || ''}
                        onChange={(e) => updateField('weight', parseInt(e.target.value) || null)}
                        placeholder="48 kg"
                        style={{ width: '100%', padding: '6px', border: '1px solid #DEE2E6', borderRadius: '4px', fontSize: '12px' }}
                      />
                    ) : (
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#121212' }}>
                        {displayProfile?.weight ? `${displayProfile.weight}kg` : '48kg'}
                      </div>
                    )}
                  </div>
                  {/* Eye Color */}
                  <div>
                    <div style={{ fontSize: '10px', color: '#6C757D', marginBottom: '3px' }}>Eye Color</div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.eyeColor || ''}
                        onChange={(e) => updateField('eyeColor', e.target.value)}
                        placeholder="Blue"
                        style={{ width: '100%', padding: '6px', border: '1px solid #DEE2E6', borderRadius: '4px', fontSize: '12px' }}
                      />
                    ) : (
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#121212' }}>
                        {displayProfile?.eyeColor || 'Blue'}
                      </div>
                    )}
                  </div>
                  {/* Hair Color */}
                  <div>
                    <div style={{ fontSize: '10px', color: '#6C757D', marginBottom: '3px' }}>Hair Color</div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.hairColor || ''}
                        onChange={(e) => updateField('hairColor', e.target.value)}
                        placeholder="Blonde"
                        style={{ width: '100%', padding: '6px', border: '1px solid #DEE2E6', borderRadius: '4px', fontSize: '12px' }}
                      />
                    ) : (
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#121212' }}>
                        {displayProfile?.hairColor || 'Blonde'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Portfolio Section - MOVED TO TOP */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#121212' }}>
                  Showreel & Portfolio
                </h3>
                <a href="#" style={{ color: '#007FFF', fontSize: '12px', textDecoration: 'none', fontWeight: '500' }}>See all</a>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {portfolioMedia.slice(0, 8).map((item, idx) => (
                  <div key={idx} style={{ aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', background: '#F8F9FA' }}>
                    {item.mimetype.startsWith('image/') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.url} alt={item.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                ))}
                {portfolioMedia.length === 0 && [1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
                  <div key={idx} style={{ aspectRatio: '16/9', borderRadius: '8px', background: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#DEE2E6' }}>
                    +
                  </div>
                ))}
              </div>
            </div>


            {/* Best Movies Section */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#121212' }}>Best movies</h3>
                <a href="#" style={{ color: '#007FFF', fontSize: '12px', textDecoration: 'none', fontWeight: '500' }}>See all</a>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((idx) => (
                  <div key={idx} style={{ aspectRatio: '2/3', borderRadius: '8px', background: `linear-gradient(135deg, ${idx % 2 === 0 ? '#007FFF' : '#FFD700'}, ${idx % 2 === 0 ? '#121212' : '#007FFF'})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: '500' }}>
                    Movie {idx}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
