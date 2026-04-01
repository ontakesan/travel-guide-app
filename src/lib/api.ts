import { supabase } from './supabase'
import type { GuideMap, MapSummary, Pin, Guide, UserProfile } from '../types'

type CreateMapInput = {
  title: string
  description: string
  area: string
  tags: string[]
  is_public: boolean
}

export async function createMap(userId: string, input: CreateMapInput): Promise<GuideMap> {
  const { data, error } = await supabase
    .from('guide_maps')
    .insert({ user_id: userId, ...input })
    .select()
    .single()

  if (error) throw error
  return data as GuideMap
}

export async function fetchMapDetail(mapId: string): Promise<MapSummary> {
  const { data, error } = await supabase
    .from('map_summary')
    .select('*')
    .eq('id', mapId)
    .single()

  if (error) throw error
  return data as MapSummary
}

export async function fetchPins(mapId: string): Promise<Pin[]> {
  const { data, error } = await supabase
    .from('pins')
    .select('*')
    .eq('map_id', mapId)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data as Pin[]
}

type CreatePinInput = {
  title: string
  description: string
  lat: number
  lng: number
}

export async function createPin(userId: string, mapId: string, input: CreatePinInput): Promise<Pin> {
  const { data, error } = await supabase
    .from('pins')
    .insert({ user_id: userId, map_id: mapId, ...input })
    .select()
    .single()

  if (error) throw error
  return data as Pin
}

export async function deletePin(pinId: string): Promise<void> {
  const { error } = await supabase.from('pins').delete().eq('id', pinId)
  if (error) throw error
}

export async function fetchPublicMaps(): Promise<MapSummary[]> {
  const { data, error } = await supabase
    .from('map_summary')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as MapSummary[]
}

export async function fetchMyMaps(userId: string): Promise<MapSummary[]> {
  const { data, error } = await supabase
    .from('map_summary')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as MapSummary[]
}

// ── Guides ──────────────────────────────────────────────────────────────────

export async function fetchGuides(): Promise<Guide[]> {
  const { data, error } = await supabase
    .from('guide_summary')
    .select('*')
    .order('follower_count', { ascending: false })

  if (error) throw error
  return (data ?? []) as Guide[]
}

export async function fetchGuideProfile(userId: string): Promise<Guide | null> {
  const { data, error } = await supabase
    .from('guide_summary')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) return null
  return data as Guide
}

// ── Bookmarks ────────────────────────────────────────────────────────────────

export async function fetchBookmarkedMaps(userId: string): Promise<MapSummary[]> {
  const { data: bookmarks, error: bErr } = await supabase
    .from('bookmarks')
    .select('map_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (bErr) throw bErr
  if (!bookmarks?.length) return []

  const mapIds = bookmarks.map(b => b.map_id)
  const { data, error } = await supabase
    .from('map_summary')
    .select('*')
    .in('id', mapIds)

  if (error) throw error
  // Preserve bookmark order
  const mapById = Object.fromEntries((data ?? []).map(m => [m.id, m]))
  return mapIds.map(id => mapById[id]).filter(Boolean) as MapSummary[]
}

export async function checkBookmark(userId: string, mapId: string): Promise<boolean> {
  const { data } = await supabase
    .from('bookmarks')
    .select('map_id')
    .eq('user_id', userId)
    .eq('map_id', mapId)
    .maybeSingle()

  return !!data
}

export async function addBookmark(userId: string, mapId: string): Promise<void> {
  const { error } = await supabase
    .from('bookmarks')
    .insert({ user_id: userId, map_id: mapId })

  if (error) throw error
}

export async function removeBookmark(userId: string, mapId: string): Promise<void> {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('map_id', mapId)

  if (error) throw error
}

// Returns new bookmark state (true = bookmarked)
export async function toggleBookmark(userId: string, mapId: string): Promise<boolean> {
  const already = await checkBookmark(userId, mapId)
  if (already) {
    await removeBookmark(userId, mapId)
    return false
  } else {
    await addBookmark(userId, mapId)
    return true
  }
}

// ── Follows ──────────────────────────────────────────────────────────────────

export async function fetchFollowedGuides(userId: string): Promise<Guide[]> {
  const { data: follows, error: fErr } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId)

  if (fErr) throw fErr
  if (!follows?.length) return []

  const guideIds = follows.map(f => f.following_id)
  const { data, error } = await supabase
    .from('guide_summary')
    .select('*')
    .in('user_id', guideIds)

  if (error) throw error
  return (data ?? []) as Guide[]
}

export async function checkFollow(followerId: string, guideId: string): Promise<boolean> {
  const { data } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', followerId)
    .eq('following_id', guideId)
    .maybeSingle()

  return !!data
}

export async function toggleFollow(followerId: string, guideId: string): Promise<boolean> {
  const already = await checkFollow(followerId, guideId)
  if (already) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', guideId)
    if (error) throw error
    return false
  } else {
    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: followerId, following_id: guideId })
    if (error) throw error
    return true
  }
}

// ── User profile ─────────────────────────────────────────────────────────────

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return null
  return data as UserProfile
}
