<?php
// actividad/ranking_donantes.php

header('Content-Type: application/json; charset=utf-8');
require_once '../config/conexion.php';

try {
    $stmt = $conexion->prepare("
        SELECT 
        u.nombre,
        u.foto_perfil,
        COUNT(cd.id_compromiso) AS total_compromisos
        FROM compromisos_donacion cd
        JOIN usuario u ON cd.id_usuario = u.id_usuario
        WHERE u.rol = 'donor'
          AND MONTH(cd.fecha_compromiso) = MONTH(CURRENT_DATE())
          AND YEAR(cd.fecha_compromiso) = YEAR(CURRENT_DATE())
        GROUP BY u.id_usuario, u.nombre
        ORDER BY total_compromisos DESC
        LIMIT 10
    ");
    $stmt->execute();
    $ranking = $stmt->fetchAll();

    echo json_encode([
        'status' => 'success',
        'ranking' => $ranking
    ]);

} catch (PDOException $e) {
    error_log('Error al obtener ranking: ' . $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => 'Error al obtener el ranking.'
    ]);
}
?>