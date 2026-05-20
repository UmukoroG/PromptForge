import { create } from 'zustand';

interface ConversationStore {
  conversationId: string | null;
  setConversationId: (id: string | null) => void;
  clearConversation: () => void;
}

export const useConversation = create<ConversationStore>((set) => ({
  conversationId: null,
  setConversationId: (id) => set({ conversationId: id }),
  clearConversation: () => set({ conversationId: null }),
}));
