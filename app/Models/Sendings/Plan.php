<?php

namespace App\Models\Sendings;

use App\Models\Sendings\Servers\Server;
use App\Traits\GlobalStatusTrait;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    use GlobalStatusTrait;
    use HasUuids;
    protected $table = 'sd_plans';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name',
        'description',
        'details',
        'price',
        'currency',
        'credits',
        'orders',
        'options',
        'custom_plans',
        'duration',
        'duration_unit',
        'servers',
        'status',
        'public',
    ];

    protected $casts = [
        'options' => 'json',
        'servers' => 'json',
        'custom_plans' => 'json',
        'public' => 'boolean',
    ];

    protected $appends = [
        'status_text'
    ];

//    แปลงเป็นข้อความ
    public function serversRelation()
    {
        return $this->hasMany(Server::class, 'id', 'servers');
    }
//    แปลงกลับตอนบันทึก
    public function setServersAttribute($value)
    {
        $this->attributes['servers'] = json_encode($value);
    }
}
