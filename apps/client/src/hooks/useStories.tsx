import axios from "axios"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import type { Story, StoryParams } from "../types/story"

const BACKEND_URL = "http://localhost:3000"

export const fetchStories = async (params: StoryParams): Promise<Story[]> => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/story/getstories`, {
      params,
      withCredentials: true,
    })
    return response.data.stories as Story[]
  } catch (err: any) {
    console.error("Story fetch failed:", err.response?.data || err.message)
    return []
  }
}

export const useStories = (params: StoryParams) => {
  return useQuery({
    queryKey: ["stories", params],
    queryFn: () => fetchStories(params),
    retry: false,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  })
}
