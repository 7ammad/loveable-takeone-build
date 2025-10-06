'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Search, Filter, User, Mail, Calendar, Tag } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface ShortlistedTalent {
  id: string;
  talentUserId: string;
  notes: string | null;
  tags: string[];
  createdAt: string;
  talent: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    bio: string | null;
    createdAt: string;
  };
}

export default function ShortlistPage() {
  const [shortlists, setShortlists] = useState<ShortlistedTalent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    fetchShortlist();
  }, []);

  const fetchShortlist = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ success: boolean; data: { shortlists: ShortlistedTalent[] } }>('/api/v1/talent/shortlist');
      const data = response.data.data.shortlists;
      setShortlists(data);
      
      // Extract unique tags
      const tags = new Set<string>();
      data.forEach((item: ShortlistedTalent) => {
        item.tags.forEach(tag => tags.add(tag));
      });
      setAllTags(Array.from(tags));
    } catch (error) {
      console.error('Failed to fetch shortlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromShortlist = async (talentId: string) => {
    try {
      await apiClient.delete(`/api/v1/talent/shortlist/${talentId}`);
      setShortlists(prev => prev.filter(item => item.talentUserId !== talentId));
    } catch (error) {
      console.error('Failed to remove from shortlist:', error);
    }
  };

  const filteredShortlists = shortlists.filter(item => {
    const matchesSearch = item.talent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.talent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTag = !selectedTag || item.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Talent Shortlist</h1>
        <p className="text-muted-foreground">
          Manage your saved talent profiles and organize them with tags and notes.
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-48">
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Tags</SelectItem>
                  {allTags.map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shortlist Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Total Shortlisted</p>
                <p className="text-2xl font-bold">{shortlists.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Tag className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Unique Tags</p>
                <p className="text-2xl font-bold">{allTags.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Filtered Results</p>
                <p className="text-2xl font-bold">{filteredShortlists.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Talent List */}
      {filteredShortlists.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No talent in shortlist</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedTag 
                ? 'No talent matches your current filters.' 
                : 'Start building your talent shortlist by saving profiles you like.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShortlists.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                      {item.talent.avatar ? (
                        <img
                          src={item.talent.avatar}
                          alt={item.talent.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.talent.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {item.talent.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveFromShortlist(item.talentUserId)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {item.talent.bio && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {item.talent.bio}
                  </p>
                )}
                
                {item.notes && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-1">Notes:</p>
                    <p className="text-sm text-muted-foreground">{item.notes}</p>
                  </div>
                )}
                
                {item.tags.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Tags:</p>
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  Added {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
