<?php

namespace App\Models\Sendings;

use App\Models\Users\User;
use App\Traits\GlobalStatusTrait;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class SendingJob extends Model
{
    use GlobalStatusTrait;
    use HasUuids;
    protected $table = 'sd_sending_jobs';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'receiver',
        'msg',
        'response',
        'send_status',
        'cost',
        'user_id',
        'sender_id',
        'server_id',
        'status',
        'is_scheduled',
        'scheduled_at',
    ];
    protected $hidden = [
        'server_id',
        'sender_id',
    ];
    protected $casts = [
        'is_scheduled' => 'boolean',
    ];
    protected $appends = [
        'status_text',
    ];
    protected $with = [
        'server',
        'sender',
        'user',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
    public function server()
    {
        return $this->belongsTo(Server::class, 'server_id', 'id');
    }
    public function sender()
    {
        return $this->belongsTo(Sender::class, 'sender_id', 'id');
    }
}
