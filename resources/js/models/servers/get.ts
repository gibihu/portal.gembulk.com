import { request } from '@/routes/password';
import api from "@/routes/api";
import { ServerType, UserType } from "@/types/user";
import { toast } from 'sonner';

export async function GetServerByUser(query: string[], setIsFetch?: (value: boolean) => void): Promise<ServerType[]> {
    setIsFetch?.(true);
    try {
        const way = api.servers.index();
        const res = await fetch(`${way.url}?${query.join('&')}`);
        const response = await res.json();
        if (res.ok) {
            return response.data;
        } else {
            toast.error(response.message);
            return [];
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        toast.error('An error occurred while fetching servers.');
        return [];
    } finally {
        setIsFetch?.(false);
    }
}