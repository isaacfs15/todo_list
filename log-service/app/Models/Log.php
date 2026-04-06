<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Log extends Model
{

    protected $fillable = [
        'acao',
        'usuario_id',
        'tarefa_id',
        'descricao',
    ];
}
