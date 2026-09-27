<?php
// solicitudes/mis_compromisos.php

session_start();
header('Content-Type: application/json; charset=utf-8');
require_once '../config/conexion.php';

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Debes iniciar sesión.']);
    exit;
}

$idUsuario = (int) $_SESSION['usuario_id'];

try {
    $stmt = $conexion->prepare("
        SELECT 
            cd.id_compromiso,
            cd.estado,
            cd.fecha_compromiso,
            cd.mensaje,
            s.titulo,
            s.ubicacion
        FROM compromisos_donacion cd
        JOIN solicitudes s ON cd.id_solicitud = s.id_solicitud
        WHERE cd.id_usuario = :id_usuario
        ORDER BY cd.fecha_compromiso DESC
    ");
    $stmt->execute([':id_usuario' => $idUsuario]);
    $compromisos = $stmt->fetchAll();

    echo json_encode([
        'status' => 'success',
        'compromisos' => $compromisos
    ]);

} catch (PDOException $e) {
    error_log('Error al listar compromisos: ' . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'Error al cargar tus compromisos.']);
}
?>