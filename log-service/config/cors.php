<?php

/**
 * config/cors.php --- log-service
 *
 * Configuração de CORS para desenvolvimento.
 * Em produção, restrinja allowed_origins ao domínio do frontend.
 */

return [
    'paths'                    => ['api/*'],
    'allowed_methods'          => ['*'],
    'allowed_origins'          => ['*'],
    'allowed_origins_patterns' => [],
    'allowed_headers'          => ['*'],
    'exposed_headers'          => [],
    'max_age'                  => 0,
    'supports_credentials'     => false,
];
