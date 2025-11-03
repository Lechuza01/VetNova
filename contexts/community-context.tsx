"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { CommunityPost, Story } from "@/lib/types"
import { mockCommunityPosts, mockStories } from "@/lib/community-data"

interface CommunityContextType {
  posts: CommunityPost[]
  stories: Story[]
  addPost: (post: Omit<CommunityPost, "id" | "date" | "likes" | "comments" | "likedBy" | "commentsList">) => void
  likePost: (postId: string, userId: string) => void
  unlikePost: (postId: string, userId: string) => void
  addComment: (postId: string, comment: Omit<CommunityPost["commentsList"][0], "id" | "date">) => void
  addStory: (story: Omit<Story, "id" | "date" | "expiresAt" | "viewedBy">) => void
  viewStory: (storyId: string, userId: string) => void
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined)

export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<CommunityPost[]>(mockCommunityPosts)
  const [stories, setStories] = useState<Story[]>(mockStories)

  // Cargar desde localStorage
  useEffect(() => {
    const savedPosts = localStorage.getItem("vetnova_community_posts")
    const savedStories = localStorage.getItem("vetnova_community_stories")
    if (savedPosts) {
      try {
        setPosts(JSON.parse(savedPosts))
      } catch (error) {
        console.error("Error loading posts:", error)
      }
    }
    if (savedStories) {
      try {
        setStories(JSON.parse(savedStories))
      } catch (error) {
        console.error("Error loading stories:", error)
      }
    }
  }, [])

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem("vetnova_community_posts", JSON.stringify(posts))
  }, [posts])

  useEffect(() => {
    localStorage.setItem("vetnova_community_stories", JSON.stringify(stories))
  }, [stories])

  const addPost = (postData: Omit<CommunityPost, "id" | "date" | "likes" | "comments" | "likedBy" | "commentsList">) => {
    const newPost: CommunityPost = {
      ...postData,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      likes: 0,
      comments: 0,
      likedBy: [],
      commentsList: [],
    }
    setPosts((prev) => [newPost, ...prev])
  }

  const likePost = (postId: string, userId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId && !post.likedBy.includes(userId)) {
          return {
            ...post,
            likes: post.likes + 1,
            likedBy: [...post.likedBy, userId],
          }
        }
        return post
      }),
    )
  }

  const unlikePost = (postId: string, userId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId && post.likedBy.includes(userId)) {
          return {
            ...post,
            likes: post.likes - 1,
            likedBy: post.likedBy.filter((id) => id !== userId),
          }
        }
        return post
      }),
    )
  }

  const addComment = (postId: string, comment: Omit<CommunityPost["commentsList"][0], "id" | "date">) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments + 1,
            commentsList: [
              ...post.commentsList,
              {
                ...comment,
                id: Date.now().toString(),
                date: new Date().toISOString(),
              },
            ],
          }
        }
        return post
      }),
    )
  }

  const addStory = (storyData: Omit<Story, "id" | "date" | "expiresAt" | "viewedBy">) => {
    const newStory: Story = {
      ...storyData,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      viewedBy: [],
    }
    setStories((prev) => [newStory, ...prev])
  }

  const viewStory = (storyId: string, userId: string) => {
    setStories((prev) =>
      prev.map((story) => {
        if (story.id === storyId && !story.viewedBy.includes(userId)) {
          return {
            ...story,
            viewedBy: [...story.viewedBy, userId],
          }
        }
        return story
      }),
    )
  }

  return (
    <CommunityContext.Provider
      value={{
        posts,
        stories,
        addPost,
        likePost,
        unlikePost,
        addComment,
        addStory,
        viewStory,
      }}
    >
      {children}
    </CommunityContext.Provider>
  )
}

export function useCommunity() {
  const context = useContext(CommunityContext)
  if (context === undefined) {
    throw new Error("useCommunity must be used within a CommunityProvider")
  }
  return context
}

