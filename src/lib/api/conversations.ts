import { apiClient } from '@/lib/api-client'
import type {
  ConversationContact,
  ConversationMessage,
  ConversationThread,
  TeacherContacts,
} from '@/types/conversation'

/** `id` é sempre a outra pessoa: o professor (visão do aluno) ou o aluno (visão do professor). */
export const conversationsApi = {
  studentContacts() {
    return apiClient.get<ConversationContact[]>('/conversations/contacts')
  },

  teacherContacts(query = '') {
    const q = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''
    return apiClient.get<TeacherContacts>(`/conversations/contacts${q}`)
  },

  thread(id: string) {
    return apiClient.get<ConversationThread>(`/conversations/with/${id}`)
  },

  send(id: string, content: string) {
    return apiClient.post<ConversationMessage>(`/conversations/with/${id}/messages`, { content })
  },

  draft(id: string) {
    return apiClient.post<{ text: string; source: 'ai' | 'local' }>(`/conversations/with/${id}/draft`, {})
  },
}
