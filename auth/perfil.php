<?php
// auth/perfil.php

session_start();
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'No hay sesión activa.']);
    exit;
}

echo json_encode([
    'status' => 'success',
    'usuario' => [
        'id_usuario' => $_SESSION['usuario_id'],
        'nombre' => $_SESSION['usuario_nombre'],
        'email' => $_SESSION['usuario_email'],
        'rol' => $_SESSION['usuario_rol'],
        'foto_perfil' => $_SESSION['usuario_foto_perfil'],
        'departamento' => $_SESSION['usuario_departamento'] ?? null,
        'distrito' => $_SESSION['usuario_distrito'] ?? null,
        'telefono' => $_SESSION['usuario_telefono'] ?? null
    ]
]);
?>