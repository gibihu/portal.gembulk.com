import { status } from './../routes/api/senders/index';
import { actions } from './../routes/api/admins/senders/requests/index';
import { standing } from './../../../../livescore-app/resources/js/routes/test/index';
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
    host: string;
    is_active
    senders?: SenderType[] | [];
    user?: UserType;
    actions?: ServerActionType[] | [];
    delete_at: string | null;
    updated_at: string;
    created_at: string;
}

export interface ServerActionType{
    id: string;
    server_id: string;
    action_key: string;
    method: string;
    endpoint?: string;
    headers: [{key: string, value: string}] | [],
    body: [{key: string, value: string}] | [],
    response: [{key: string, value: string}] | [],
    standing?: string[],
    status: number;
    status_text: string;
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

export interface CampaignType {
    id: string;
    name: string;
    action_key: string;
    receivers: string | string[];
    receiver_s: CampaignReceiverType[];
    message: string;
    data: any[];
    total_cost: string;
    status: number;
    status_text: string;
    sender_name: string;
    response: any[];
    response_report: any[];
    response_callback: any[];
    sender_id: string;
    sender?: SenderType;
    user_id: string;
    user?: UserType;
    server_name: string;
    server_id: string;
    server?: ServerType;
    sent_at?: string;
    scheduled_at: string;
    delete_at?: string;
    updated_at: string;
    created_at: string;
}

export interface CampaignReceiverType {
    id: string;
    receiver: string;
    sender_name: string;
    message: string;
    response?: any[];
    const: number;
    action_key: string;
    sent_at?: string;
    response_report?: any[];
    response_callback?: any[];
    campaign_id: string;
    campaign?: CampaignType;
    status: number;
    status_text: string;
    updated_at: string;
    created_at: string;
}