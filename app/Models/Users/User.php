<?php

namespace App\Models\Users;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\Sendings\Plan;
use App\Traits\GlobalStatusTrait;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use GlobalStatusTrait, HasUuids, HasFactory;
    protected $table = 'users';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name',
        'username',
        'email',
        'email_verified_at',
        'password',
        'credits',
        'plan_id',
        'roles',
        'avatar',
        'verified_at',
        'status',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
        'plan_id'
    ];
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    protected $with = [];
    protected $appends = [
    ];

    public function plan()
    {
        return $this->belongsTo(Plan::class, 'plan_id', 'id');
    }

    public function apiKeys()
    {
        return $this->hasMany(ApiKey::class);
    }

//    แปลงเป็นข้อความ
    public function getRolesAttribute($value)
    {
        $ids = json_decode($value, true) ?? [];
        return Role::whereIn('id', $ids)->pluck('name')->toArray();
    }
//    แปลงกลับตอนบันทึก
    public function setRolesAttribute($value)
    {
        // ถ้าส่งมาเป็น name → แปลงเป็น id
        if (is_array($value)) {

            // ถ้าเป็นตัวเลขอยู่แล้ว
            if (is_numeric($value[0] ?? null)) {
                $ids = $value;
            } else {
                // เป็นชื่อ role
                $ids = Role::whereIn('name', $value)
                    ->pluck('id')
                    ->toArray();
            }

            $this->attributes['roles'] = json_encode($ids);

        } else {

            $this->attributes['roles'] = json_encode([]);
        }
    }
    public function verifications()
    {
        return $this->hasMany(UserVerification::class);
    }

    public function latestVerification()
    {
        return $this->hasOne(UserVerification::class)->latest();
    }
}
