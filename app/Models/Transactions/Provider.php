<?php

namespace App\Models\Transactions;

use App\Traits\GlobalStatusTrait;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Provider extends Model
{

    use HasUuids, softDeletes;
    use GlobalStatusTrait;
    protected $table = 'tc_providers';

    protected $fillable = [
        'code',
        'name',
        'host',
        'status',
    ];

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'provider_id');
    }
}
