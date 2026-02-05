<?php

namespace App\Services;


use Illuminate\Support\Facades\Http;

class P2wPayService
{
    protected static array $endpoints = [];
    protected static array $headers = [];
    protected static bool $booted = false;
    /**
     * Create a new class instance.
     */
    protected static function boot(): void
    {
        if (self::$booted) {
            return;
        }

        $base_url = "https://payment.p2wpay.com/api/v1/";

        $endpoints = [
            'deposit'  => 'deposit',
            'withdraw' => 'withdraw',
        ];

        self::$endpoints = array_map(
            fn ($e) => rtrim($base_url, '/') . '/' . ltrim($e, '/'),
            $endpoints
        );

        self::$headers = [
            'x-api-key'    => config('services.p2wpay.key'),
            'Content-Type' => 'application/json',
        ];

        self::$booted = true;
    }

    public static function deposit($request)
    {
        self::boot(); // init ก่อนใช้
        if (isset($request['transaction_id'])) {
            self::$endpoints['deposit'] .= '/' . $request['transaction_id'];
            $response = Http::withHeaders(self::$headers)
                ->timeout(30)
                ->get(self::$endpoints['deposit']);
        }else{
            $body = [
                'account_name'    => $request['account_name'] ?? 'a',
                'account_number'  => $request['account_number'] ?? '0000000000',
                'bank_code'       => $request['bank_code'] ?? 'SCB',
                'amount'          => $request['amount'] ?? 0,
                'payment_type'    => $request['payment_type'] ?? 'qr_code',
                'custom_order_id' => $request['custom_order_id'] ?? null,
            ];

            $response = Http::withHeaders(self::$headers)
                ->timeout(30)
                ->post(self::$endpoints['deposit'], $body);
        }
//        dd(self::$headers, self::$endpoints['deposit'], $response->json());

        $return = [
            'success' => $response->successful(),
            'status'  => $response->status(),
            'data'    => $response->successful() ? $response->json() : null,
            'error'   => $response->failed() ? $response->json() : null,
        ];

        return $return;
    }

    public static function depositCheck($request)
    {
        self::boot();

    }
}
