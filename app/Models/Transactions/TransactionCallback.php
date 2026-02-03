<?php

namespace App\Models\Transactions;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class TransactionCallback extends Model
{
    use HasUuids;
    protected $table = 'tc_transaction_callbacks';

    protected $fillable = [
        'transaction_id',
        'event',
        'payload',
    ];

    protected $casts = [
        'payload' => 'array',
    ];

    /** Relations */
    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }
}
