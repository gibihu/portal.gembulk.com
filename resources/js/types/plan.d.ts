
export interface PlanType {
    id: string;
    name: string;
    description?: string;
    detail?: string;
    details?: string;
    price?: number | string;
    currency?: string;
    credits: number;
    order: number;
    options?: Record<string, string>;
    custom_plans?: Record<string, string>[];
    duration: number;
    duration_unit: number;
    duration_unit_text?: 'days' | 'months' | 'years' | 'lifetime';
    servers?: string[];
    status: number;
    status_text?: string;
    created_at: string;
    updated_at: string;
}