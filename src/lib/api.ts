import { supabase } from './supabase'
import type { GuideMap, MapSummary, Pin } from '../types'

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
