<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('logs', function (Blueprint $table) {
            $table->id();
            $table->string('acao');                               // CRIACAO|CONCLUSAO|REABERTURA|ERRO
            $table->unsignedBigInteger('usuario_id');
            $table->unsignedBigInteger('tarefa_id')->nullable();  // null em logs de erro
            $table->text('descricao');
            $table->timestamps();                                 // created_at + updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('logs');
    }
};
