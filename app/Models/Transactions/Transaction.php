<?php

namespace App\Models\Transactions;

use App\Models\Sendings\Plan;
use App\Models\Users\User;
use App\Traits\GlobalStatusTrait;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasUuids;
    use GlobalStatusTrait;
    protected $table = 'tc_transactions';

    protected $fillable = [
        'provider_id',
        'user_id',
        'provider_name',
        'transaction_id',
        'plan_id',
        'payment_method',
        'type',
        'amount',
        'fee',
        'net_amount',
        'tax',
        'tax_invoice',
        'currency',
        'expired_at',
        'paid_at',
        'status',
    ];

    protected $casts = [
        'expired_at' => 'datetime',
        'paid_at'    => 'datetime',
        'amount'     => 'decimal:2',
        'fee'        => 'decimal:2',
        'net_amount' => 'decimal:2',
        'tax'        => 'decimal:2',
        'tax_invoice'=> 'decimal:2',
    ];

    protected $appends = [
        'status_text'
    ];

    /** Relations */

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }
    public function user()
    {
        return $this->belongsTo(Plan::class, 'user_id', 'id');
    }

    public function detail()
    {
        return $this->hasOne(TransactionDetail::class);
    }

    public function callbacks()
    {
        return $this->hasMany(TransactionCallback::class);
    }
}
