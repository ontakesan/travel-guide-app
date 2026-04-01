export type GuideMap = {
  id: string
  user_id: string
  title: string
  description: string | null
  area: string | null
  cover_url: string | null
  is_public: boolean
  tags: string[]
  view_count: number
  created_at: string
  updated_at: string
}

export type MapSummary = GuideMap & {
  author_name: string
  author_avatar: string | null
  pin_count: number
  bookmark_count: number
}

export type Pin = {
  id: string
  map_id: string
  user_id: string
  title: string
  description: string | null
  access_note: string | null
  lat: number
  lng: number
  sort_order: number
  tags: string[]
  category: string | null
  created_at: string
  updated_at: string
}

export type Guide = {
  user_id: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  map_count: number
  follower_count: number
}

export type UserProfile = {
  id: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  created_at: string
}
