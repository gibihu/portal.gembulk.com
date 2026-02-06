<?php

namespace App\Models;

use App\Models\Users\User;
use App\Traits\GlobalStatusTrait;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UploadFile extends Model
{
    use GlobalStatusTrait, HasUuids, softDeletes;
    protected $table = 'upload_files';

    protected $fillable = [
        'name',
        'path',
        'name',
        'full_path',
        'file_properties',
        'owner_id',
        'status',
    ];

    protected $hidden = [];
    public $timestamps = true;
    protected $appends = [
        'status_text',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'owner_id', 'id');
    }
}
