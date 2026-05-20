"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { MessageSquare, Plus, Trash2, MoreVertical, Loader2 } from "lucide-react";
import { useConversation } from "@/hooks/use-conversation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  _count: {
    messages: number;
  };
}

export const ConversationHistory = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const { conversationId, setConversationId, clearConversation } = useConversation();
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchConversations = async (cursor?: string, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const url = cursor
        ? `/api/conversations?cursor=${cursor}&limit=20`
        : "/api/conversations?limit=20";

      const response = await axios.get(url);

      if (append) {
        setConversations((prev) => [...prev, ...response.data.conversations]);
      } else {
        setConversations(response.data.conversations);
      }

      setNextCursor(response.data.nextCursor);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      toast.error("Failed to load conversation history");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Refresh list when conversationId changes (new conversation created)
  useEffect(() => {
    if (conversationId) {
      fetchConversations();
    }
  }, [conversationId]);

  // Infinite scroll using Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursor && !loadingMore) {
          fetchConversations(nextCursor, true);
        }
      },
      { threshold: 1.0 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [nextCursor, loadingMore]);

  const handleNewConversation = () => {
    clearConversation();
    window.location.reload();
  };

  const handleSelectConversation = (id: string) => {
    setConversationId(id);
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this conversation?")) {
      return;
    }

    try {
      await axios.delete(`/api/conversations/${id}`);
      toast.success("Conversation deleted");

      // If deleting the active conversation, clear it
      if (conversationId === id) {
        clearConversation();
        window.location.reload();
      }

      // Refresh the list
      fetchConversations();
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      toast.error("Failed to delete conversation");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-gradient-to-b from-violet-900 to-violet-800 text-white shadow-xl">
      <div className="px-3 py-2 flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-6 px-3">
          <h2 className="text-lg font-semibold">Conversations</h2>
          <Button
            onClick={handleNewConversation}
            size="sm"
            variant="ghost"
            className="hover:bg-white/10"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          {loading ? (
            <div className="px-3 py-2 text-sm text-zinc-400 flex items-center justify-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading...
            </div>
          ) : conversations.length === 0 ? (
            <div className="px-3 py-2 text-sm text-zinc-400">
              No conversations yet
            </div>
          ) : (
            <>
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation.id)}
                  className={cn(
                    "group flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-white/10 transition-all",
                    conversationId === conversation.id
                      ? "bg-white/20 text-white"
                      : "text-zinc-300"
                  )}
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <MessageSquare className="h-4 w-4 mr-3 flex-shrink-0 text-violet-300" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {conversation.title}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {conversation._count.messages} messages • {formatDate(conversation.updatedAt)}
                      </p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => handleDeleteConversation(conversation.id, e)}
                        className="text-red-600 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}

              {/* Infinite scroll trigger */}
              {nextCursor && (
                <div ref={observerTarget} className="px-3 py-4 flex items-center justify-center">
                  {loadingMore && (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin text-violet-300" />
                      <span className="text-sm text-zinc-400">Loading more...</span>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
