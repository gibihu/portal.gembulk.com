
export interface PlanType {
    id: string;
    name: string;
    description?: string;
    detail?: string;
    details?: string;
    price: number;
    currency?: string;
    credit_limit: number;
    orders: number;
    options?: Record<string, string>;
    custom_plans?: Record<string, string>[];
    duration: number;
    duration_unit: number;
    duration_unit_text?: 'days' | 'months' | 'years' | 'lifetime';
    duration_unit_th_text: 'วัน' | 'เดือน' | 'ปี' | 'ตลอดชีวิต';
    servers?: string[];
    status: number;
    status_text?: string;
    more_than: number;
    recommended: boolean;
    tax_rate: number;
    tax_type: string;
    fee_label: string;
    fee_rate: number;
    fee_type: string;
    created_at: string;
    updated_at: string;
}