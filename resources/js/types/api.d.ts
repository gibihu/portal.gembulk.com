import { UserType } from './user';

export interface ApiKeyType {
    id: string;
    token: string;
    template?: string;
    options: { [key: string]: boolean };
    permissions: { [key: string]: boolean };
    user?: UserType;
    status: number;
    status_text: string;
    created_at: string;
    updated_at: string;
}