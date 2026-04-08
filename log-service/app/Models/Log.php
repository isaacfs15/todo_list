<?php

/**
 * Model Eloquent da tabela "logs".
 *
 * $fillable define os campos aceitos via Log::create(), protegendo
 * contra Mass Assignment. Os nomes seguem snake_case (padrão MySQL).
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    /**
     * Campos permitidos para inserção em massa.
     * Devem corresponder às colunas da tabela "logs".
     */
    protected $fillable = [
        'acao',
        'usuario_id',
        'tarefa_id',
        'descricao',
    ];
}
