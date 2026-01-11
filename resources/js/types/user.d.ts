export interface UserType {
    id: string;
    name: string;
    username: string;
    email: string;
    email_verified_at?: string;
    credit: number;
    senders?: string[];
    plan_id?: string;
    plan: PlanType;
    roles: string[];
    avatar: string;
    updated_at: string;
    created_at: string;
}


export interface PlanType{
    id: string;
    name: string;
    description: string;
    details: string;
    price: number;
    currency: string;
    credits: number;
    orders: number;
    options: PlanOptionType;
    custom_plans: string[];
    duration: number;
    duration_unit: number;
    servers: serverType[];
    updated_at: string;
    created_at: string;
}

export interface PlanOptionType {

}


export interface ServerType {
    id: string;
    name: string;
    static_name: string;
    host: string;
    url: string;
    method: string;
    settings: ServerSettingType;
    headers: ServerHeaderType;
    body: ServerBodyType;
    callbacks: ServerCallBackType;
    senders?: SenderType[] | [];
    updated_at: string;
    created_at: string;
}

export interface ServerSettingType {
    credits: ServerSettingCreditType;
}
export interface ServerSettingCreditType{
    amount: number | 0;
    sync_url: string;
    callback: string[];
}
export interface ServerHeaderType {

}
export interface ServerBodyType {

}
export interface ServerCallBackType {

}
export interface SenderType {
    id: string;
    user_id: string | null;
    name: string;
    status: number;
    status_text: string;
    server?: ServerType | null;
    user?: UserType | null;
    updated_at: string;
    created_at: string;
}

export interface ReportType {
    id: string;
    receiver: string;
    msg: string;
    response: string[];
    send_status: number;
    send_status_text: string;
    cost: number;
    user: UserType;
    sender: SenderType;
    server: ServerType;
    status: number;
    status_text: string;
    is_scheduled: boolean;
    scheduled_at: string;
    updated_at: string;
    created_at: string;
}
