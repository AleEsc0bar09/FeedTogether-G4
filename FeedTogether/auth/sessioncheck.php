<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

if (isset($_SESSION['usuario_id'])) {
    echo json_encode([
        'status' => 'success',
        'authenticated' => true,
        'usuario' => [
            'id' => $_SESSION['usuario_id'],
            'nombre' => $_SESSION['usuario_nombre'],
            'email' => $_SESSION['usuario_email'],
            'rol' => $_SESSION['usuario_rol']
        ]
    ]);
} else {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'authenticated' => false]);
    
}