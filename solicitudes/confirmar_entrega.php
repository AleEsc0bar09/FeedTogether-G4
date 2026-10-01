<?php
// solicitudes/confirmar_entrega.php

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

if (!$idCompromiso) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid pledge.']);
    exit;
}

try {
    // Only the owner of the request can confirm, and only if the pledge
    // is still in progress or was already marked as delivered by the donor.
    $stmt = $conexion->prepare("
        UPDATE compromisos_donacion cd
        JOIN solicitudes s ON cd.id_solicitud = s.id_solicitud
        SET cd.estado = 'completado'
        WHERE cd.id_compromiso = :id_compromiso
          AND s.id_usuario = :id_usuario
          AND cd.estado IN ('pendiente', 'entregado')
    ");
    $stmt->execute([
        ':id_compromiso' => $idCompromiso,
        ':id_usuario' => $idUsuario
    ]);

    if ($stmt->rowCount() === 0) {
        echo json_encode([
            'status' => 'error',
            'message' => 'The delivery could not be confirmed. It may already be completed or cancelled.'
        ]);
        exit;
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Thanks for confirming the delivery!'
    ]);

} catch (PDOException $e) {
    error_log('Error al confirmar entrega: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'The delivery could not be confirmed.']);
}
?>