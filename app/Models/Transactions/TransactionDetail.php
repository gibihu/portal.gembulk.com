<?php

namespace App\Models\Transactions;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class TransactionDetail extends Model
{
    use HasUuids;
    protected $table = 'tc_transaction_details';

    protected $fillable = [
        'transaction_id',
        'bank_code',
        'account_name',
        'account_number',
        'qr_code',
        'phone_number',
        'extra',
    ];

    protected $casts = [
        'extra' => 'array',
    ];

    /** Relations */

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }
}
