<?php
namespace App\Helpers\Rules;

use App\Models\Sendings\Campaign;

class HttpRuleHelper
{
    public static function SMSBodyRule(Campaign $item): array{
        return [
            'message' => $item->message,
            'sender' => $item->sender->name,
            'receiver' => $item->receivers,
        ];
    }
}
