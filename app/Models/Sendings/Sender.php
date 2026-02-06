<?php

namespace App\Models\Sendings;

use App\Models\Sendings\Servers\Server;
use App\Models\Users\User;
use App\Models\UploadFile;
use App\Traits\GlobalStatusTrait;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Sender extends Model
{
    use GlobalStatusTrait;
    use HasUuids;
    protected $table = 'sd_senders';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name',
        'user_id',
        'server_id',
        'resource_ids',
        'content',
        'status',
    ];
    protected $casts = [
        'resource_ids' => 'array',
    ];
    protected $appends = [
        'status_text',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function server()
    {
        return $this->belongsTo(Server::class, 'server_id', 'id');
    }

    // เพิ่มฟังก์ชัน auto สำหรับ resource
    public function getResourceAttribute()
    {
        // ตรวจสอบว่า resource_ids มีข้อมูลหรือไม่
        if (!empty($this->resource_ids) && is_array($this->resource_ids)) {
            $resources = [];
            foreach ($this->resource_ids as $id) {
                $file = UploadFile::find($id);
                if ($file) {
                    $url = config('app.url') . '/f/' . base64_encode($file->id);
                    $resources[] = $url;
                }
            }
            return $resources;
        }
        return [];
    }
}
