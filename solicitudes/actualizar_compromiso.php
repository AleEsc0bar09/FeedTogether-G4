<?php
// solicitudes/actualizar_compromiso.php

session_start();
header('Content-Type: application/json; charset=utf-8');
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
    exit;
}

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'You must log in.']);
    exit;
}

$idUsuario = (int) $_SESSION['usuario_id'];
$idCompromiso = filter_var($_POST['id_compromiso'] ?? '', FILTER_VALIDATE_INT);
$nuevoEstado = trim($_POST['estado'] ?? '');

if (!$idCompromiso) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid pledge.']);
    exit;
}

// Only "pendiente" -> "entregado" or "cancelado" is allowed.
// "completado" can only be set by the requester (confirmar_entrega.php)
if (!in_array($nuevoEstado, ['entregado', 'cancelado'], true)) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid status.']);
    exit;
}

try {
    // WHERE conditions:
    // - the pledge must belong to the user making the request
    // - it must still be pending
    // - the request must still be active (if the requester already closed it, it is not modified)
    $stmt = $conexion->prepare("
        UPDATE compromisos_donacion cd
        JOIN solicitudes s ON cd.id_solicitud = s.id_solicitud
        SET cd.estado = :estado
        WHERE cd.id_compromiso = :id_compromiso
          AND cd.id_usuario = :id_usuario
          AND cd.estado = 'pendiente'
          AND s.estado = 'activa'
    ");
    $stmt->execute([
        ':estado' => $nuevoEstado,
        ':id_compromiso' => $idCompromiso,
        ':id_usuario' => $idUsuario
    ]);

    if ($stmt->rowCount() === 0) {
        echo json_encode([
            'status' => 'error',
            'message' => 'The pledge could not be updated. It may no longer be in progress, or the request may have been closed.'
        ]);
        exit;
    }

    echo json_encode([
        'status' => 'success',
        'message' => $nuevoEstado === 'entregado'
            ? 'Marked as delivered. Waiting for the requester to confirm.'
            : 'Pledge cancelled.'
    ]);

} catch (PDOException $e) {
    error_log('Error al actualizar compromiso: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'The pledge could not be updated.']);
}
?>