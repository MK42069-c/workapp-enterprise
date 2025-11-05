'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Search, 
  X, 
  Filter,
  BookOpen,
  Brain,
  TrendingUp
} from 'lucide-react'

interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void
  placeholder?: string
  categories?: string[]
}

export interface SearchFilters {
  category?: string
  level?: string
  duration?: string
  sortBy?: string
}

export function AdvancedSearch({ 
  onSearch, 
  placeholder = "Search courses, assessments...",
  categories = ['All', 'AI & Technology', 'Business', 'Leadership', 'Cybersecurity']
}: AdvancedSearchProps) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({})
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = () => {
    onSearch(query, filters)
  }

  const handleClearFilters = () => {
    setFilters({})
    onSearch(query, {})
  }

  const activeFiltersCount = Object.keys(filters).length

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={placeholder}
            className="pl-10 pr-10"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQuery('')}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button onClick={handleSearch}>
          Search
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <Filter className="h-4 w-4" />
          {activeFiltersCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Badge
            key={cat}
            variant={filters.category === cat ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => {
              const newFilters = filters.category === cat 
                ? { ...filters, category: undefined }
                : { ...filters, category: cat }
              setFilters(newFilters)
              onSearch(query, newFilters)
            }}
          >
            {cat}
          </Badge>
        ))}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Level Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty Level</label>
                <div className="flex flex-wrap gap-2">
                  {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                    <Badge
                      key={level}
                      variant={filters.level === level ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setFilters({ ...filters, level })}
                    >
                      {level}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Duration Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Duration</label>
                <div className="flex flex-wrap gap-2">
                  {['< 1 hour', '1-3 hours', '3+ hours'].map((duration) => (
                    <Badge
                      key={duration}
                      variant={filters.duration === duration ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setFilters({ ...filters, duration })}
                    >
                      {duration}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <div className="flex flex-wrap gap-2">
                  {['Relevance', 'Popular', 'Newest'].map((sort) => (
                    <Badge
                      key={sort}
                      variant={filters.sortBy === sort ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setFilters({ ...filters, sortBy: sort })}
                    >
                      {sort}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search Suggestions */}
      {query.length > 0 && query.length < 3 && (
        <div className="text-sm text-gray-500">
          Type at least 3 characters to search
        </div>
      )}
    </div>
  )
}

// Popular Searches Component
export function PopularSearches({ onSearch }: { onSearch: (query: string) => void }) {
  const popularSearches = [
    { query: 'AI fundamentals', icon: Brain },
    { query: 'Leadership skills', icon: TrendingUp },
    { query: 'Online courses', icon: BookOpen },
  ]

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500">Popular searches:</p>
      <div className="flex flex-wrap gap-2">
        {popularSearches.map(({ query, icon: Icon }) => (
          <Button
            key={query}
            variant="outline"
            size="sm"
            onClick={() => onSearch(query)}
            className="text-xs"
          >
            <Icon className="h-3 w-3 mr-2" />
            {query}
          </Button>
        ))}
      </div>
    </div>
  )
}