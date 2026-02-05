<?php

namespace App\Models\Transactions;

use App\Traits\GlobalStatusTrait;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Bank extends Model
{
    use HasUuids;
    use GlobalStatusTrait;

    protected $table = 'tc_banks';

    protected $fillable = [
        'code',
        'name',
        'status',
    ];

    public function transactionDetails()
    {
        return $this->hasMany(TransactionDetail::class, 'bank_id');
    }
}
