'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Sparkles, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { castingTemplates, getAllCategories, type CastingTemplate } from '@/lib/casting-templates';

interface TemplateSelectorProps {
  onSelectTemplate: (template: CastingTemplate | null) => void;
  onClose: () => void;
}

export function TemplateSelector({ onSelectTemplate, onClose }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<CastingTemplate | null>(null);

  const categories = getAllCategories();

  const filteredTemplates = castingTemplates.filter(template => {
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = () => {
    onSelectTemplate(selectedTemplate);
    onClose();
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Choose a Template</h2>
                <p className="text-sm text-muted-foreground">
                  Start with a pre-built template or create from scratch
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-180px)] bg-gray-50 dark:bg-gray-800">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(selectedCategory || searchQuery) && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>

          {/* Custom Template Option */}
          <Card 
            className={`mb-4 cursor-pointer transition-all ${
              !selectedTemplate ? 'ring-2 ring-primary' : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedTemplate(null)}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Create from Scratch</h3>
                  <p className="text-sm text-muted-foreground">
                    Start with a blank form and customize everything yourself
                  </p>
                </div>
                {!selectedTemplate && (
                  <Badge variant="default">Selected</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{template.icon}</div>
                      <div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{template.category}</p>
                      </div>
                    </div>
                    {selectedTemplate?.id === template.id && (
                      <Badge variant="default">Selected</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {template.description}
                  </p>
                  
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div>
                      <strong>Title:</strong> {template.template.title}
                    </div>
                    <div>
                      <strong>Type:</strong> {template.template.projectType}
                    </div>
                    <div>
                      <strong>Duration:</strong> {template.template.shootingDuration}
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or category filter.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-white dark:bg-gray-900">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              {selectedTemplate ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedTemplate.icon}</span>
                  <div>
                    <div className="font-medium text-foreground">{selectedTemplate.name}</div>
                    <div className="text-xs">{selectedTemplate.category}</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span>Create from scratch</span>
                </div>
              )}
            </div>
            <div className="flex space-x-3 w-full sm:w-auto">
              <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
                Cancel
              </Button>
              <Button onClick={handleUseTemplate} className="flex-1 sm:flex-none">
                {selectedTemplate ? 'Use Template' : 'Start Fresh'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
