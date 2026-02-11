<?php

namespace App\Models\Users;

use App\Models\Sendings\Plan;
use App\Traits\GlobalStatusTrait;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class UserVerification extends Model
{

    use GlobalStatusTrait, HasUuids;
    protected $table = 'user_verifications';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'data',
        'status',
        'rejected_reason',
        'admin_id',
        'submitted_at',
        'verified_at',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    protected $appends = [
        'status_text',
    ];
    
    public function user()
    {
        return $this->belongsTo(Plan::class, 'user_id', 'id');
    }
}
