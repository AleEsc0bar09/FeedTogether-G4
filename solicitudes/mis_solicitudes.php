<?php
// solicitudes/mis_solicitudes.php

session_start();
header('Content-Type: application/json; charset=utf-8');
require_once '../config/conexion.php';

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'You must log in.']);
    exit;
}

$idUsuario = (int) $_SESSION['usuario_id'];

try {
    $stmt = $conexion->prepare("
        SELECT
            s.id_solicitud,
            s.titulo,
            s.ubicacion,
            s.cantidad_beneficiados,
            s.estado,
            s.fecha_publicacion,
            (SELECT COUNT(*) FROM compromisos_donacion cd WHERE cd.id_solicitud = s.id_solicitud) AS total_compromisos
        FROM solicitudes s
        WHERE s.id_usuario = :id_usuario
        ORDER BY s.fecha_publicacion DESC
    ");
    $stmt->execute([':id_usuario' => $idUsuario]);
    $solicitudes = $stmt->fetchAll();

    $stmtComp = $conexion->prepare("
        SELECT cd.id_compromiso, u.nombre, u.foto_perfil, u.telefono, u.email,
               cd.mensaje, cd.fecha_compromiso, cd.estado
        FROM compromisos_donacion cd
        JOIN usuario u ON cd.id_usuario = u.id_usuario
        WHERE cd.id_solicitud = :id_solicitud
        ORDER BY cd.fecha_compromiso DESC
    ");

    foreach ($solicitudes as &$sol) {
        $stmtComp->execute([':id_solicitud' => $sol['id_solicitud']]);
        $sol['donantes'] = $stmtComp->fetchAll();
    }
    unset($sol);

    echo json_encode([
        'status' => 'success',
        'solicitudes' => $solicitudes
    ]);

} catch (PDOException $e) {
    error_log('Error al listar mis solicitudes: ' . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'Error loading your requests.']);
}
?>