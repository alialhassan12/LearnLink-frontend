export interface Message {
    id: number;
    sender_id: number;
    conversation_id: number;
    content: string | null;
    file_url: string | null;
    type: string;
    created_at: string;
    updated_at: string;
    sender?: {
        id: number;
        name: string;
        email: string;
        avatar: string;
    };
}