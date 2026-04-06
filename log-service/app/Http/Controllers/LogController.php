<?php

namespace App\Http\Controllers;

use App\Models\Log;
use Illuminate\Http\Request;

class LogController extends Controller
{
    /**
     * POST /api/logs
     * Recebe log do task-service, valida os campos e persiste.
     */
    public function store(Request $request)
    {
        // Validação dos campos camelCase vindos do Node.js
        $validado = $request->validate([
            'acao'      => 'required|string|in:CRIACAO,CONCLUSAO,REABERTURA,ERRO',
            'usuarioId' => 'required|integer',
            'tarefaId'  => 'nullable|integer',
            'descricao' => 'required|string',
        ]);

        // Mapeamento camelCase (JS) → snake_case (MySQL)
        $log = Log::create([
            'acao'       => $validado['acao'],
            'usuario_id' => $validado['usuarioId'],
            'tarefa_id'  => $validado['tarefaId'] ?? null,
            'descricao'  => $validado['descricao'],
        ]);

        return response()->json($log, 201);
    }

    /**
     * GET /api/logs
     * Retorna todos os logs em ordem decrescente de criação.
     * Útil para inspeção via Postman durante o desenvolvimento.
     */
    public function index()
    {
        return response()->json(Log::orderByDesc('created_at')->get());
    }

    /**
     * GET /api/logs/{usuarioId}
     * Retorna logs de um usuário específico, do mais recente ao mais antigo.
     *
     * @param int $usuarioId
     */
    public function porUsuario($usuarioId)
    {
        return response()->json(
            Log::where('usuario_id', $usuarioId)
                ->orderByDesc('created_at')
                ->get()
        );
    }
}
