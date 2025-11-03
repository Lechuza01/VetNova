"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  FaHeart,
  FaComment,
  FaShare,
  FaPlus,
  FaEllipsisH,
  FaImage,
  FaTimes,
  FaCamera,
} from "react-icons/fa"
import { useCommunity } from "@/contexts/community-context"
import { useAuth } from "@/contexts/auth-context"
import { useClinic } from "@/contexts/clinic-context"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export default function CommunityPage() {
  const { posts, stories, likePost, unlikePost, addComment, addPost } = useCommunity()
  const { user } = useAuth()
  const { pets } = useClinic()
  const { toast } = useToast()
  const [newComment, setNewComment] = useState<Record<string, string>>({})
  const [showComments, setShowComments] = useState<Record<string, boolean>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [newPostContent, setNewPostContent] = useState("")
  const [newPostImages, setNewPostImages] = useState<string[]>([])

  const activeStories = stories.filter(
    (story) => new Date(story.expiresAt) > new Date(),
  )

  const handleLike = (postId: string) => {
    if (!user) return
    const post = posts.find((p) => p.id === postId)
    if (post?.likedBy.includes(user.id)) {
      unlikePost(postId, user.id)
    } else {
      likePost(postId, user.id)
    }
  }

  const handleAddComment = (postId: string) => {
    if (!user || !newComment[postId]?.trim()) return

    addComment(postId, {
      userId: user.id,
      userName: user.name,
      userAvatar: undefined,
      content: newComment[postId],
    })

    setNewComment((prev) => ({ ...prev, [postId]: "" }))
    toast({
      title: "Comentario agregado",
      description: "Tu comentario se ha publicado",
    })
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewPostImages((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleCreatePost = () => {
    if (!user || (!newPostContent.trim() && newPostImages.length === 0)) {
      toast({
        title: "Error",
        description: "El post debe tener contenido o imágenes",
        variant: "destructive",
      })
      return
    }

    const selectedPet = pets.find((p) => p.clientId === user.id) || pets[0]

    addPost({
      userId: user.id,
      userName: user.name,
      userAvatar: undefined,
      petId: selectedPet?.id,
      petName: selectedPet?.name,
      petPhoto: selectedPet?.photo,
      content: newPostContent,
      images: newPostImages,
    })

    setNewPostContent("")
    setNewPostImages([])
    toast({
      title: "Post publicado",
      description: "Tu post se ha publicado en la comunidad",
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Comunidad</h1>
          <p className="text-muted-foreground mt-1">Comparte momentos con tus mascotas</p>
        </div>
      </div>

      {/* Historias */}
      {activeStories.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {activeStories.map((story) => (
                <div
                  key={story.id}
                  className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer"
                >
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary">
                      <Image
                        src={story.image}
                        alt={story.petName || story.userName}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    {story.viewedBy.length === 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-background" />
                    )}
                  </div>
                  <p className="text-xs text-center truncate w-full">{story.petName || story.userName}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Crear Post */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{user?.name || "Usuario"}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="¿Qué quieres compartir sobre tu mascota?"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            rows={3}
          />
          {newPostImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {newPostImages.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                  <Image src={img} alt={`Preview ${index}`} fill className="object-cover" sizes="150px" />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={() => setNewPostImages((prev) => prev.filter((_, i) => i !== index))}
                  >
                    <FaTimes className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <FaImage className="mr-2" />
                Foto
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>
            <Button onClick={handleCreatePost} disabled={!newPostContent.trim() && newPostImages.length === 0}>
              Publicar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feed de Posts */}
      <div className="space-y-4">
        {posts.map((post) => {
          const isLiked = user ? post.likedBy.includes(user.id) : false
          const timeAgo = formatDistanceToNow(new Date(post.date), { addSuffix: true, locale: es })

          return (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={post.userAvatar} />
                      <AvatarFallback>{post.userName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{post.userName}</p>
                      {post.petName && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <span>con</span>
                          {post.petPhoto && (
                            <Avatar className="w-4 h-4">
                              <AvatarImage src={post.petPhoto} />
                            </Avatar>
                          )}
                          <span>{post.petName}</span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">{timeAgo}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <FaEllipsisH />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {post.content && <p className="whitespace-pre-wrap">{post.content}</p>}
                {post.images && post.images.length > 0 && (
                  <div className={`grid gap-2 ${post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                    {post.images.map((img, index) => (
                      <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                        <Image src={img} alt={`Post image ${index}`} fill className="object-cover" sizes="800px" />
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    className={isLiked ? "text-red-500" : ""}
                  >
                    <FaHeart className={`mr-2 ${isLiked ? "fill-current" : ""}`} />
                    {post.likes}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowComments((prev) => ({ ...prev, [post.id]: !prev[post.id] }))}
                  >
                    <FaComment className="mr-2" />
                    {post.comments}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <FaShare className="mr-2" />
                    Compartir
                  </Button>
                </div>

                {/* Comentarios */}
                {showComments[post.id] && (
                  <div className="space-y-3 pt-4 border-t">
                    {post.commentsList.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={comment.userAvatar} />
                          <AvatarFallback>{comment.userName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-muted rounded-lg p-3">
                            <p className="font-medium text-sm">{comment.userName}</p>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(comment.date), { addSuffix: true, locale: es })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex gap-2">
                        <Input
                          placeholder="Escribe un comentario..."
                          value={newComment[post.id] || ""}
                          onChange={(e) => setNewComment((prev) => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault()
                              handleAddComment(post.id)
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddComment(post.id)}
                          disabled={!newComment[post.id]?.trim()}
                        >
                          Enviar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

