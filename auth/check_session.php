
<?php
// auth/check_session.php

session_start();
header('Content-Type: application/json; charset=utf-8');

if (isset($_SESSION['usuario_id'])) {
    echo json_encode([
        'logueado' => true,
        'rol' => $_SESSION['usuario_rol'] ?? null
    ]);
} else {
    echo json_encode([
        'logueado' => false
    ]);
}
?>