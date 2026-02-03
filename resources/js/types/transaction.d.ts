import { event } from './../../../../../livescore-app/resources/js/routes/api/match/index';
import { create } from './../../../../../livescore-app/resources/js/routes/dash/post/index';
import { id } from './../../../../../livescore-app/resources/js/routes/api/follow/following/index';

export interface TransactionType {
    id: string;
    provider_id: string;
    provider_name: string;
    transaction_id?: string;
    plan_id?: string;
    payment_method?: string;
    type: string;
    amount: number;
    fee: number;
    net_amount: number;
    tax: number;
    tax_invoice?: string;
    currency: string;
    expired_at?: string;
    status: number;
    status_text: string;
    created_at: string;
    updated_at: string;
    detail?: TransactionDetailType;
    callbacks?: TransactionCallbackType;
}

export interface TransactionDetailType {
    id: string;
    transaction_id: string
    bank_code: string;
    account_name?: string;
    account_number?: string;
    qr_code?: string;
    phone_number?: string;
    extra?: any;
    created_at: string;
    updated_at: string;
}

export interface TransactionCallbackType {
    id: string;
    transaction_id: string;
    event?: string;
    payload?: any;
    created_at: string;
    updated_at: string;
}