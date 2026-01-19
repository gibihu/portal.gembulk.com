<?php
namespace App\Helpers\Servers\Actions;

use App\Models\Sendings\Campaign;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Throwable;

class ActionServerHelper
{
    public static function ActionSMS(Campaign $item): Campaign|bool|array
    {
        try{
            $now = Carbon::now();
            $server = $item->server;
            $ac = $server->action_sms;
            if(empty($ac->endpoint) || empty($ac->method)){ return false; }

            $sender = $item->sender;
            $headers = ActionServerHelper::GetKeyValue($ac->headers);
            $param = [];
            foreach ($ac->body as $body) {
                if(empty($body)){ return false; }
                if (!empty($body['message'])) {
                    $param[$body['message']] = $item->message;
                }

// sender
                if (!empty($body['sender'])) {
                    $param[$body['sender']] = $sender->name;
                }

// receivers
                if (!empty($body['receivers'])) {
                    $param[$body['receivers']] = $item->receivers;
                }

// scheduled_at
//                $isScheduled = filter_var($body['scheduled_at'] ?? false, FILTER_VALIDATE_BOOLEAN);
                if (!empty($body['scheduled_at'])) {
                    $param[$body['scheduled_at']] = $item->scheduled_at ?? null;
                }

// scheduled_at_date / time
                if ($item->scheduled_at) {

                    if (!empty($body['scheduled_at_date'])) {
                        $param[$body['scheduled_at_date']] =
                            Carbon::parse($item->scheduled_at)->format('Y-m-d');
                    }

                    if (!empty($body['scheduled_at_time'])) {
                        $param[$body['scheduled_at_time']] =
                            Carbon::parse($item->scheduled_at)->format('H:i:s');
                    }
                }

// api key (บาง provider ใช้ชื่อไม่เหมือนกัน)
                if (!empty($body['api_key'])) {
                    $param[$body['api_key']] = $body['api_key'] ?? null;
                }

                if (!empty($body['key'])) {
                    $param[$body['key']] = $body['key'] ?? null;
                }

// now_date / now_time
                if (!empty($body['now_date'])) {
                    $param[$body['now_date']] = $now->format('Y-m-d');
                }

                if (!empty($body['now_time'])) {
                    $param[$body['now_time']] = $now->format('H:i:s');
                }
            }

            $sent = ActionServerHelper::sendRequest($ac, $ac->method, $ac->endpoint, $headers, $param);
            if($sent !== false){
                [$item->response, $item->response_callback] = $sent;
                $item->sent_at = $now->format('Y-m-d H:i:s');
                $item->status = Campaign::STATUS_COMPLETED;
                $item->receiver_s->each(function ($i) use ($item) {
                    $i->status = $item->status;
                    $i->save();
                });

            }else{
                $item->status = Campaign::STATUS_FAILED;
            }
            return $item;
        }catch (Throwable $e){
            return[
                'message' => $e->getMessage(),
            ];
        }
    }
    public static function GetKeyValue(array $array): array
    {
        $items = [];

        foreach ($array as $item) {

            // ต้องเป็น array และมีอย่างน้อย 1 key
            if (!is_array($item)) {
                continue;
            }

            foreach ($item as $key => $value) {
                $items[$key] = $value;
            }
        }

        return $items;
    }

    public static function sendRequest($ac, $method, $endpoint, $header, $param)
    {
        switch(strtoupper($method)) {
            case 'POST':
                $response = Http::withHeaders($header)->post($endpoint, $param);
                break;
            default:
                $response = Http::withHeaders($header)->get($endpoint, $param);
                break;
        }

        if($response->status() < 500)
        {
            $mapping = $ac->response;
            $result = $response->json();

            $callback = [];

            $callback['success'] = ActionServerHelper::getByPath(
                $result,
                $mapping['success'] ?? 'success',
                false
            );

            $callback['status'] = ActionServerHelper::getByPath(
                $result,
                $mapping['status'] ?? 'status',
                $response->status()
            );

            $callback['message'] = ActionServerHelper::getByPath(
                $result,
                $mapping['message'] ?? 'message',
                null
            );

            return [$result, $callback];
        }else{
            return false;
        }
    }

    public static function getByPath(array $data, string $path, $default = null)
    {
        $keys = explode('.', $path);

        foreach ($keys as $key) {
            if (!is_array($data) || !array_key_exists($key, $data)) {
                return $default;
            }
            $data = $data[$key];
        }

        return $data;
    }

    public static function shouldSend(Campaign $item): bool
    {
        $serverSupportSchedule = collect($item->server->action_sms->body)
            ->contains(fn ($row) => array_key_exists('scheduled_at', $row));

        if ($serverSupportSchedule) {
            return true;
        }

        if (empty($item->scheduled_at)) {
            return true;
        }

        return now()->gte($item->scheduled_at);
    }

}
