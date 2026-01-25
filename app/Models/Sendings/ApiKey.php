<?php

namespace App\Models\Sendings;

use App\Models\Users\User;
use App\Traits\GlobalStatusTrait;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ApiKey extends Model
{
    use GlobalStatusTrait;
    use HasUuids;
    protected $table = 'sd_senders';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'token',
        'template',
        'options',
        'permissions',
        'user_id',
        'status',
    ];

    protected $appends = [
        'status_text',
    ];

    protected $casts = [
        'options' => 'array',
        'permissions' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public static function generateUniqueToken(): string
    {
        do {
            // สุ่ม 32 bytes = 64 ตัวอักษร hex
            $token = bin2hex(random_bytes(32));
        } while (self::where('token', $token)->exists());

        return $token;
    }
}
