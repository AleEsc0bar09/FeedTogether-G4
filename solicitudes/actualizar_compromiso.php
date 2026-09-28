<?php
// solicitudes/actualizar_compromiso.php

session_start();
header('Content-Type: application/json; charset=utf-8');
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido.']);
    exit;
}

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Debes iniciar sesión.']);
    exit;
}

$idUsuario = (int) $_SESSION['usuario_id'];
$idCompromiso = filter_var($_POST['id_compromiso'] ?? '', FILTER_VALIDATE_INT);
$nuevoEstado = trim($_POST['estado'] ?? '');

if (!$idCompromiso) {
    echo json_encode(['status' => 'error', 'message' => 'Compromiso no válido.']);
    exit;
}

// Solo se permite pasar de "pendiente" a "completado" o "cancelado"
if (!in_array($nuevoEstado, ['completado', 'cancelado'], true)) {
    echo json_encode(['status' => 'error', 'message' => 'Estado no válido.']);
    exit;
}

try {
    // Condiciones del WHERE:
    // - el compromiso debe ser del usuario que hace la petición
    // - debe seguir pendiente
    // - la solicitud debe seguir activa (si el solicitante ya la cerró, no se modifica)
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
            'message' => 'No se pudo actualizar el compromiso. Puede que ya no esté en progreso o que la solicitud haya sido cerrada.'
        ]);
        exit;
    }

    echo json_encode([
        'status' => 'success',
        'message' => $nuevoEstado === 'completado'
            ? '¡Gracias por completar tu donación!'
            : 'Compromiso cancelado.'
    ]);

} catch (PDOException $e) {
    error_log('Error al actualizar compromiso: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'No se pudo actualizar el compromiso.']);
}
?>